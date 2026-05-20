package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"github.com/chzyer/readline"
)

const skillFile = "SKILL.md"
const version = "0.0.1"

// Configuration Git
const (
	envGitToken      = "GIT_TOKEN"
	envGitUrl        = "GIT_URL"
	envGitProject    = "GIT_PROJECT"
	envGitSkillsPath = "GIT_SKILLS_PATH"
	envGitRef        = "GIT_REF"

	defaultGitUrl        = "https://github.com"
	defaultGitProject    = "green-code-initiative/ai-green-skills"
	defaultGitSkillsPath = "skills"
	defaultGitRef        = "experiment" // branch/tag to use when no semver tag found
)

// --- Semver ---

type semver struct{ major, minor, patch int }

func parseSemver(s string) (semver, bool) {
	s = strings.TrimPrefix(s, "v")
	parts := strings.SplitN(s, ".", 3)
	if len(parts) != 3 {
		return semver{}, false
	}
	major, e1 := strconv.Atoi(parts[0])
	minor, e2 := strconv.Atoi(parts[1])
	patch, e3 := strconv.Atoi(parts[2])
	if e1 != nil || e2 != nil || e3 != nil {
		return semver{}, false
	}
	return semver{major, minor, patch}, true
}

func (a semver) less(b semver) bool {
	if a.major != b.major {
		return a.major < b.major
	}
	if a.minor != b.minor {
		return a.minor < b.minor
	}
	return a.patch < b.patch
}

// --- Configuration / .env ---

var envFileCache map[string]string

func loadEnvFile(path string) map[string]string {
	result := make(map[string]string)
	f, err := os.Open(path)
	if err != nil {
		return result
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if len(val) >= 2 &&
			((val[0] == '"' && val[len(val)-1] == '"') ||
				(val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		result[key] = val
	}
	return result
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	if envFileCache == nil {
		envFileCache = loadEnvFile(".env")
		if len(envFileCache) == 0 {
			home, _ := os.UserHomeDir()
			envFileCache = loadEnvFile(filepath.Join(home, ".config", "cli-skills", ".env"))
		}
	}
	if v := envFileCache[key]; v != "" {
		return v
	}
	return defaultVal
}

// httpClient is the shared HTTP client with an explicit timeout.
var httpClient = &http.Client{Timeout: 15 * time.Second}

// --- Console Windows (arrow key navigation) ---

var (
	kernel32              = syscall.NewLazyDLL("kernel32.dll")
	procGetStdHandle      = kernel32.NewProc("GetStdHandle")
	procGetConsoleMode    = kernel32.NewProc("GetConsoleMode")
	procSetConsoleMode    = kernel32.NewProc("SetConsoleMode")
	procReadConsoleInputW = kernel32.NewProc("ReadConsoleInputW")
)

const (
	stdInputHandle  = 0xFFFFFFF6 // STD_INPUT_HANDLE  = -10 as DWORD
	stdOutputHandle = 0xFFFFFFF5 // STD_OUTPUT_HANDLE = -11 as DWORD

	enableLineInput    = 0x0002
	enableEchoInput    = 0x0004
	enableProcessedIn  = 0x0001
	enableVTOutput     = 0x0004
	enableProcessedOut = 0x0001

	keyEventType uint16 = 0x0001
	vkReturn            = 0x0D
	vkEscape            = 0x1B
	vkUp                = 0x26
	vkDown              = 0x28
)

// inputRecord représente WIN32 INPUT_RECORD (20 octets).
type inputRecord struct {
	EventType       uint16
	_               [2]byte // padding
	KeyDown         int32
	RepeatCount     uint16
	VirtualKeyCode  uint16
	VirtualScanCode uint16
	UnicodeChar     uint16
	ControlKeyState uint32
}

// --- Client API Git ---

type GitTag struct {
	Name string `json:"name"`
}

type GitTreeItem struct {
	Name        string `json:"name"`
	Type        string `json:"type"`         // "tree" = directory, "blob" = file, "dir" = GitHub directory
	Path        string `json:"path"`         // full path from the repository root
	DownloadURL string `json:"download_url"` // GitHub: direct download URL
}

// isGitHub reports whether the base URL targets GitHub.
func isGitHub(baseURL string) bool {
	return strings.Contains(baseURL, "github.com")
}

// setAuthHeader sets the appropriate auth header for the host.
func setAuthHeader(req *http.Request, token string) {
	if token == "" {
		return
	}
	if isGitHub(req.URL.Host + req.URL.Scheme + req.URL.String()) {
		req.Header.Set("Authorization", "Bearer "+token)
	} else {
		req.Header.Set("PRIVATE-TOKEN", token)
	}
}

// doAPIRequest executes a single authenticated GET request and returns the response.
func doAPIRequest(apiURL, token string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, err
	}
	if token != "" {
		if strings.Contains(apiURL, "github.com") || strings.Contains(apiURL, "api.github.com") {
			req.Header.Set("Authorization", "Bearer "+token)
		} else {
			req.Header.Set("PRIVATE-TOKEN", token)
		}
	}
	req.Header.Set("Accept", "application/json")
	return httpClient.Do(req)
}

// GitGetPaged makes paginated API calls and accumulates all results.
// Supports both GitLab (X-Next-Page) and GitHub (Link rel="next") pagination.
func GitGetPaged[T any](apiURL, token string) ([]T, error) {
	var all []T
	currentURL := apiURL
	for {
		resp, err := doAPIRequest(currentURL, token)
		if err != nil {
			return nil, err
		}

		switch resp.StatusCode {
		case http.StatusOK:
			// OK, continue
		case http.StatusUnauthorized, http.StatusForbidden:
			resp.Body.Close()
			return nil, fmt.Errorf("authentication refused — check GIT_TOKEN")
		case http.StatusNotFound:
			resp.Body.Close()
			return nil, fmt.Errorf("project not found — check GIT_PROJECT")
		default:
			resp.Body.Close()
			return nil, fmt.Errorf("HTTP response %d", resp.StatusCode)
		}

		var items []T
		err = json.NewDecoder(resp.Body).Decode(&items)
		resp.Body.Close()
		if err != nil {
			return nil, err
		}
		all = append(all, items...)

		// GitLab pagination
		if next := resp.Header.Get("X-Next-Page"); next != "" {
			nextNum, err := strconv.Atoi(next)
			if err != nil || nextNum == 0 {
				break
			}
			// append or replace page param
			if idx := strings.LastIndex(currentURL, "&page="); idx >= 0 {
				currentURL = currentURL[:idx] + fmt.Sprintf("&page=%d", nextNum)
			} else {
				currentURL = fmt.Sprintf("%s&page=%d", apiURL, nextNum)
			}
			continue
		}
		// GitHub pagination via Link header
		if link := resp.Header.Get("Link"); link != "" {
			nextURL := parseGitHubNextLink(link)
			if nextURL != "" {
				currentURL = nextURL
				continue
			}
		}
		break
	}
	return all, nil
}

// parseGitHubNextLink extracts the URL with rel="next" from a GitHub Link header.
func parseGitHubNextLink(header string) string {
	for _, part := range strings.Split(header, ",") {
		part = strings.TrimSpace(part)
		if strings.Contains(part, `rel="next"`) {
			if start := strings.Index(part, "<"); start >= 0 {
				if end := strings.Index(part, ">"); end > start {
					return part[start+1 : end]
				}
			}
		}
	}
	return ""
}

func latestSemverTag(baseURL, project, token string) (string, error) {
	var apiURL string
	if isGitHub(baseURL) {
		apiURL = fmt.Sprintf("https://api.github.com/repos/%s/tags?per_page=100", project)
	} else {
		apiURL = fmt.Sprintf("%s/api/v4/projects/%s/repository/tags?per_page=100",
			baseURL, url.PathEscape(project))
	}
	tags, err := GitGetPaged[GitTag](apiURL, token)
	if err != nil {
		return "", err
	}
	var best semver
	bestName := ""
	for _, t := range tags {
		sv, ok := parseSemver(t.Name)
		if !ok {
			continue
		}
		if bestName == "" || best.less(sv) {
			best = sv
			bestName = t.Name
		}
	}
	if bestName == "" {
		return getEnv(envGitRef, defaultGitRef), nil
	}
	return bestName, nil
}

func remoteSkillsAtRef(baseURL, project, token, ref string) ([]string, error) {
	skillsPath := getEnv(envGitSkillsPath, defaultGitSkillsPath)
	var apiURL string
	if isGitHub(baseURL) {
		apiURL = fmt.Sprintf("https://api.github.com/repos/%s/contents/%s?ref=%s&per_page=100",
			project, url.PathEscape(skillsPath), url.QueryEscape(ref))
	} else {
		apiURL = fmt.Sprintf("%s/api/v4/projects/%s/repository/tree?path=%s&ref=%s&per_page=100",
			baseURL, url.PathEscape(project), url.QueryEscape(skillsPath), url.QueryEscape(ref))
	}
	items, err := GitGetPaged[GitTreeItem](apiURL, token)
	if err != nil {
		return nil, err
	}
	var skills []string
	for _, item := range items {
		// GitHub uses "dir", GitLab uses "tree"
		if (item.Type == "tree" || item.Type == "dir") && !strings.HasPrefix(item.Name, ".") {
			skills = append(skills, item.Name)
		}
	}
	sort.Strings(skills)
	return skills, nil
}

type remoteSkillMeta struct {
	version     string
	description string
}

// fetchRemoteSkillMeta retrieves version and description from a remote SKILL.md in a single HTTP call.
func fetchRemoteSkillMeta(cfg GitConfig, skillName, ref string) remoteSkillMeta {
	skillsPath := getEnv(envGitSkillsPath, defaultGitSkillsPath)
	filePath := skillsPath + "/" + skillName + "/" + skillFile
	var rawURL string
	if isGitHub(cfg.baseURL) {
		rawURL = fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/%s",
			cfg.project, url.QueryEscape(ref), filePath)
	} else {
		rawURL = fmt.Sprintf("%s/api/v4/projects/%s/repository/files/%s/raw?ref=%s",
			cfg.baseURL, url.PathEscape(cfg.project), url.PathEscape(filePath), url.QueryEscape(ref))
	}
	resp, err := doAPIRequest(rawURL, cfg.token)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		return remoteSkillMeta{}
	}
	defer resp.Body.Close()
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return remoteSkillMeta{}
	}
	s := string(content)
	return remoteSkillMeta{
		version:     parseFrontmatterField(bufio.NewScanner(strings.NewReader(s)), "version"),
		description: parseFrontmatterField(bufio.NewScanner(strings.NewReader(s)), "description"),
	}
}

// remoteSkillVersion récupère la valeur du champ "version" dans le SKILL.md distant.
func remoteSkillVersion(cfg GitConfig, skillName, ref string) string {
	return fetchRemoteSkillMeta(cfg, skillName, ref).version
}

// --- Installation metadata ---

type meta struct {
	Skills map[string]string `json:"skills"` // nom du skill -> tag installé
}

func metaFilePath() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".config", "cli-skills", "meta.json")
}

func loadMeta() meta {
	m := meta{Skills: make(map[string]string)}
	data, err := os.ReadFile(metaFilePath())
	if err != nil {
		return m
	}
	if err := json.Unmarshal(data, &m); err != nil {
		return m
	}
	if m.Skills == nil {
		m.Skills = make(map[string]string)
	}
	return m
}

func saveMeta(m meta) error {
	p := metaFilePath()
	if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, data, 0600)
}

// --- Application configuration (skill destination) ---

type appConfig struct {
	SkillsDir string `json:"skills_dir,omitempty"`
}

func appConfigFilePath() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".config", "cli-skills", "config.json")
}

func loadAppConfig() appConfig {
	var cfg appConfig
	data, err := os.ReadFile(appConfigFilePath())
	if err != nil {
		return cfg
	}
	_ = json.Unmarshal(data, &cfg)
	return cfg
}

func saveAppConfig(cfg appConfig) error {
	p := appConfigFilePath()
	if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, data, 0600)
}

// reloadSkillsDirs re-reads the config and updates the list of skill directories.
func reloadSkillsDirs() {
	home, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Cannot determine home directory: %v\n", err)
		os.Exit(1)
	}
	dir := loadAppConfig().SkillsDir
	if dir == "" {
		dir = filepath.Join(home, ".copilot", "skills")
	}
	skillsDirs = []struct {
		label string
		path  string
	}{
		{"VSCode (.copilot)", dir},
	}
}

type GitConfig struct {
	token   string
	baseURL string
	project string // owner/repo (not URL-encoded)
}

func requireGitConfig() GitConfig {
	baseURL := getEnv(envGitUrl, defaultGitUrl)
	project := getEnv(envGitProject, defaultGitProject)
	token := getEnv(envGitToken, "")
	// Token is required only for private repos / GitLab
	if token == "" && !isGitHub(baseURL) {
		fmt.Fprintln(os.Stderr, "Git token missing.")
		fmt.Fprintln(os.Stderr, "Set GIT_TOKEN in an environment variable or in a .env file")
		os.Exit(1)
	}
	return GitConfig{
		token:   token,
		baseURL: baseURL,
		project: project,
	}
}

// --- Download ---

func downloadFile(fileURL, token, destPath string) error {
	resp, err := doAPIRequest(fileURL, token)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	f, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = io.Copy(f, resp.Body)
	return err
}

func downloadSkill(cfg GitConfig, skillName, ref, destDir string) error {
	skillsPath := getEnv(envGitSkillsPath, defaultGitSkillsPath)
	remotePath := skillsPath + "/" + skillName
	var apiURL string
	if isGitHub(cfg.baseURL) {
		apiURL = fmt.Sprintf("https://api.github.com/repos/%s/git/trees/%s?recursive=1",
			cfg.project, url.QueryEscape(ref))
	} else {
		apiURL = fmt.Sprintf("%s/api/v4/projects/%s/repository/tree?path=%s&ref=%s&recursive=true&per_page=100",
			cfg.baseURL, url.PathEscape(cfg.project), url.QueryEscape(remotePath), url.QueryEscape(ref))
	}

	if isGitHub(cfg.baseURL) {
		// GitHub git/trees API returns a flat list of all repo files
		type ghTreeItem struct {
			Path string `json:"path"`
			Type string `json:"type"` // "blob" or "tree"
		}
		type ghTreeResp struct {
			Tree []ghTreeItem `json:"tree"`
		}
		resp, err := doAPIRequest(apiURL, cfg.token)
		if err != nil {
			return err
		}
		var treeResp ghTreeResp
		err = json.NewDecoder(resp.Body).Decode(&treeResp)
		resp.Body.Close()
		if err != nil {
			return err
		}
		for _, item := range treeResp.Tree {
			if item.Type != "blob" {
				continue
			}
			if !strings.HasPrefix(item.Path, remotePath+"/") {
				continue
			}
			relPath := strings.TrimPrefix(item.Path, remotePath+"/")
			localPath := filepath.Join(destDir, relPath)
			if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
				return err
			}
			rawURL := fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/%s",
				cfg.project, url.QueryEscape(ref), item.Path)
			if err := downloadFile(rawURL, cfg.token, localPath); err != nil {
				return fmt.Errorf("%s : %w", item.Path, err)
			}
			fmt.Printf("    + %s\n", relPath)
		}
		return nil
	}

	// GitLab path
	items, err := GitGetPaged[GitTreeItem](apiURL, cfg.token)
	if err != nil {
		return err
	}
	for _, item := range items {
		if item.Type != "blob" {
			continue
		}
		relPath := strings.TrimPrefix(item.Path, remotePath+"/")
		localPath := filepath.Join(destDir, relPath)
		if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
			return err
		}
		fileURL := fmt.Sprintf("%s/api/v4/projects/%s/repository/files/%s/raw?ref=%s",
			cfg.baseURL, url.PathEscape(cfg.project), url.PathEscape(item.Path), url.QueryEscape(ref))
		if err := downloadFile(fileURL, cfg.token, localPath); err != nil {
			return fmt.Errorf("%s : %w", item.Path, err)
		}
		fmt.Printf("    + %s\n", relPath)
	}
	return nil
}

// --- Commands: install / update / version ---

func cmdInstall(name string, all bool) {
	if !all && name == "" {
		fmt.Fprintln(os.Stderr, "Usage: cli-skills install <skill-name> | --all")
		os.Exit(1)
	}
	cfg := requireGitConfig()

	fmt.Printf("Connecting to %s ...\n", cfg.baseURL)
	ref, err := latestSemverTag(cfg.baseURL, cfg.project, cfg.token)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Tag error: %v\n", err)
		os.Exit(1)
	}
	defaultRef := getEnv(envGitRef, defaultGitRef)
	if ref == defaultRef {
		fmt.Printf("No semver tag found, using branch: %s\n", ref)
	} else {
		fmt.Printf("Latest tag   : %s\n", ref)
	}

	remoteSkills, err := remoteSkillsAtRef(cfg.baseURL, cfg.project, cfg.token, ref)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Remote list error: %v\n", err)
		os.Exit(1)
	}

	if all {
		installed := 0
		skipped := 0
		m := loadMeta()
		for _, s := range remoteSkills {
			if findSkill(s) != nil {
				fmt.Printf("  %-35s already installed, skipped\n", s)
				skipped++
				continue
			}
			destDir := filepath.Join(skillsDirs[0].path, s)
			fmt.Printf("  Installing %-35s", s)
			if err := downloadSkill(cfg, s, ref, destDir); err != nil {
				os.RemoveAll(destDir)
				fmt.Fprintf(os.Stderr, "\033[31mERROR\033[0m: %v\n", err)
				continue
			}
			skillVer := extractVersion(destDir)
			if skillVer != "" {
				m.Skills[s] = skillVer
				fmt.Printf("\033[32m✓ v%s\033[0m\n", skillVer)
			} else {
				m.Skills[s] = ref
				fmt.Printf("\033[32m✓\033[0m\n")
			}
			installed++
		}
		if err := saveMeta(m); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: metadata not saved: %v\n", err)
		}
		fmt.Printf("\n%d skill(s) installed, %d skipped.\n", installed, skipped)
		return
	}

	// Single skill install
	if findSkill(name) != nil {
		fmt.Printf("Skill %q is already installed. Use 'update' to update it.\n", name)
		return
	}
	found := false
	for _, s := range remoteSkills {
		if s == name {
			found = true
			break
		}
	}
	if !found {
		fmt.Fprintf(os.Stderr, "Skill %q not found on repository (ref. %s).\n", name, ref)
		os.Exit(1)
	}

	destDir := filepath.Join(skillsDirs[0].path, name)
	fmt.Printf("Installing %q ...\n", name)
	if err := downloadSkill(cfg, name, ref, destDir); err != nil {
		os.RemoveAll(destDir)
		fmt.Fprintf(os.Stderr, "Installation error: %v\n", err)
		os.Exit(1)
	}

	skillVer := extractVersion(destDir)
	m := loadMeta()
	if skillVer != "" {
		m.Skills[name] = skillVer
	} else {
		m.Skills[name] = ref
	}
	if err := saveMeta(m); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: metadata not saved: %v\n", err)
	}
	if skillVer != "" {
		fmt.Printf("Skill %q successfully installed (v%s).\n", name, skillVer)
	} else {
		fmt.Printf("Skill %q successfully installed (ref. %s).\n", name, ref)
	}
}

func cmdUpdate(name string, all bool) {
	cfg := requireGitConfig()
	fmt.Printf("Connecting to %s ...\n", cfg.baseURL)
	ref, err := latestSemverTag(cfg.baseURL, cfg.project, cfg.token)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Tag error: %v\n", err)
		os.Exit(1)
	}
	defaultRef := getEnv(envGitRef, defaultGitRef)
	if ref == defaultRef {
		fmt.Printf("No semver tag found, using branch: %s\n", ref)
	} else {
		fmt.Printf("Latest tag   : %s\n", ref)
	}

	m := loadMeta()
	var toUpdate []Skill
	if all {
		toUpdate = listSkills()
		if len(toUpdate) == 0 {
			fmt.Println("No skill installed.")
			return
		}
	} else {
		s := findSkill(name)
		if s == nil {
			fmt.Fprintf(os.Stderr, "Skill %q not installed.\n", name)
			os.Exit(1)
		}
		toUpdate = []Skill{*s}
	}

	updated := 0
	for _, s := range toUpdate {
		remoteVer := remoteSkillVersion(cfg, s.Name, ref)
		localVer := s.Version
		if localVer != "" && remoteVer != "" && localVer == remoteVer {
			fmt.Printf("  %-35s already up to date (v%s)\n", s.Name, localVer)
			continue
		}
		from := localVer
		if from == "" {
			from = m.Skills[s.Name]
		}
		if from == "" {
			from = "unknown"
		}
		to := remoteVer
		if to == "" {
			to = ref
		}
		fmt.Printf("  %-35s %s → %s\n", s.Name, from, to)
		if err := os.RemoveAll(s.Path); err != nil {
			fmt.Fprintf(os.Stderr, "  Removal error %s: %v\n", s.Name, err)
			continue
		}
		if err := downloadSkill(cfg, s.Name, ref, s.Path); err != nil {
			fmt.Fprintf(os.Stderr, "  Download error %s: %v\n", s.Name, err)
			continue
		}
		newVer := extractVersion(s.Path)
		if newVer != "" {
			m.Skills[s.Name] = newVer
		} else {
			m.Skills[s.Name] = ref
		}
		updated++
	}

	if updated > 0 {
		if err := saveMeta(m); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: metadata not saved: %v\n", err)
		}
		fmt.Printf("\n%d skill(s) updated.\n", updated)
	} else {
		fmt.Println("\nAll skills are already up to date.")
	}
}

func cmdVersion() {
	fmt.Printf("cli-skills version %s\n", version)
}

func cmdSearch(query string) {
	if query == "" {
		fmt.Fprintln(os.Stderr, "Usage: search <query>")
		return
	}
	cfg := requireGitConfig()
	fmt.Printf("Connecting to %s ...\n", cfg.baseURL)

	ref, err := latestSemverTag(cfg.baseURL, cfg.project, cfg.token)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Tag error: %v\n", err)
		os.Exit(1)
	}
	defaultRef := getEnv(envGitRef, defaultGitRef)
	if ref == defaultRef {
		fmt.Printf("No semver tag found, using branch: %s\n", ref)
	} else {
		fmt.Printf("Latest tag   : %s\n", ref)
	}

	skills, err := remoteSkillsAtRef(cfg.baseURL, cfg.project, cfg.token, ref)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Skill list error: %v\n", err)
		os.Exit(1)
	}

	// Fetch remote info for all skills so we can search in description too
	fmt.Printf("Fetching remote info")
	allInfos := make(map[string]remoteSkillMeta, len(skills))
	for _, s := range skills {
		allInfos[s] = fetchRemoteSkillMeta(cfg, s, ref)
		fmt.Print(".")
	}
	fmt.Println()

	lower := strings.ToLower(query)
	var matches []string
	for _, s := range skills {
		info := allInfos[s]
		if strings.Contains(strings.ToLower(s), lower) ||
			strings.Contains(strings.ToLower(info.description), lower) {
			matches = append(matches, s)
		}
	}

	if len(matches) == 0 {
		fmt.Printf("No skill matching %q.\n", query)
		return
	}

	// Local versions
	localVersions := make(map[string]string)
	installed := make(map[string]bool)
	for _, s := range listSkills() {
		installed[s.Name] = true
		localVersions[s.Name] = s.Version
	}

	fmt.Printf("\n%-35s %-10s %-28s %s\n", "NAME", "VERSION", "STATUS", "DESCRIPTION")
	fmt.Println(strings.Repeat("─", 120))
	for _, s := range matches {
		info := allInfos[s]
		ver := info.version
		if ver == "" {
			ver = "—"
		}
		var status string
		if installed[s] {
			localVer := localVersions[s]
			if localVer == "" {
				localVer = "unknown"
			}
			if info.version != "" && localVer != info.version {
				status = fmt.Sprintf("installed, update available (v%s)", localVer)
			} else {
				status = "installed"
			}
		} else {
			status = "available"
		}
		fmt.Printf("%-35s %-10s %-28s %s\n", s, ver, status, info.description)
	}
	fmt.Printf("\n%d skill(s) found for %q (ref. %s).\n", len(matches), query, ref)
}

func cmdCatalog() {
	cfg := requireGitConfig()
	fmt.Printf("Connecting to %s ...\n", cfg.baseURL)

	ref, err := latestSemverTag(cfg.baseURL, cfg.project, cfg.token)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Tag error: %v\n", err)
		os.Exit(1)
	}
	defaultRef := getEnv(envGitRef, defaultGitRef)
	if ref == defaultRef {
		fmt.Printf("No semver tag found, using branch: %s\n", ref)
	} else {
		fmt.Printf("Latest tag   : %s\n", ref)
	}

	skills, err := remoteSkillsAtRef(cfg.baseURL, cfg.project, cfg.token, ref)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Skill list error: %v\n", err)
		os.Exit(1)
	}

	if len(skills) == 0 {
		fmt.Println("No skill available on the repository.")
		return
	}

	// Local versions
	localVersions := make(map[string]string)
	installed := make(map[string]bool)
	for _, s := range listSkills() {
		installed[s.Name] = true
		localVersions[s.Name] = s.Version
	}

	// Fetch remote info (1 call per skill)
	fmt.Printf("Fetching remote info")
	remoteInfos := make(map[string]remoteSkillMeta, len(skills))
	for _, s := range skills {
		remoteInfos[s] = fetchRemoteSkillMeta(cfg, s, ref)
		fmt.Print(".")
	}
	fmt.Println()

	fmt.Printf("\n%-35s %-10s %-28s %s\n", "NAME", "VERSION", "STATUS", "DESCRIPTION")
	fmt.Println(strings.Repeat("─", 120))
	for _, s := range skills {
		info := remoteInfos[s]
		ver := info.version
		if ver == "" {
			ver = "—"
		}
		var status string
		if installed[s] {
			localVer := localVersions[s]
			if localVer == "" {
				localVer = "unknown"
			}
			if info.version != "" && localVer != info.version {
				status = fmt.Sprintf("installed, update available (v%s)", localVer)
			} else {
				status = "installed"
			}
		} else {
			status = "available"
		}
		fmt.Printf("%-35s %-10s %-28s %s\n", s, ver, status, info.description)
	}
	fmt.Printf("\n%d skill(s) available (ref. %s).\n", len(skills), ref)
}

var skillsDirs []struct {
	label string
	path  string
}

func init() {
	reloadSkillsDirs()
}

type Skill struct {
	Name        string
	Path        string
	Version     string
	Description string
	Source      string
}

// parseFrontmatter parses all key:value pairs from a SKILL.md YAML frontmatter.
// Fields nested under a parent key (indented) are stored as "parent.child" (e.g. "metadata.version").
// All keys are lowercased. Surrounding quotes are stripped from values.
func parseFrontmatter(scanner *bufio.Scanner) map[string]string {
	result := make(map[string]string)
	firstLine := true
	inFrontmatter := false
	currentParent := ""
	for scanner.Scan() {
		raw := scanner.Text()
		trimmed := strings.TrimSpace(raw)
		if firstLine {
			firstLine = false
			if trimmed == "---" {
				inFrontmatter = true
				continue
			}
			return result
		}
		if !inFrontmatter || trimmed == "---" {
			break
		}
		if trimmed == "" {
			continue
		}
		idx := strings.Index(trimmed, ":")
		if idx < 0 {
			continue
		}
		key := strings.ToLower(strings.TrimSpace(trimmed[:idx]))
		val := strings.TrimSpace(trimmed[idx+1:])
		if len(val) >= 2 &&
			((val[0] == '"' && val[len(val)-1] == '"') ||
				(val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		indent := len(raw) - len(strings.TrimLeft(raw, " \t"))
		if indent > 0 && currentParent != "" {
			result[currentParent+"."+key] = val
		} else {
			result[key] = val
			if val == "" {
				currentParent = key
			} else {
				currentParent = ""
			}
		}
	}
	return result
}

// parseFrontmatterField extracts a single field from a SKILL.md frontmatter scanner.
// It looks for the field at the top level first, then under "metadata.<field>" (new header format).
func parseFrontmatterField(scanner *bufio.Scanner, field string) string {
	fm := parseFrontmatter(scanner)
	key := strings.ToLower(field)
	if v := fm[key]; v != "" {
		return v
	}
	return fm["metadata."+key]
}

// extractFrontmatterField lit un champ du frontmatter YAML depuis le SKILL.md d'un skill local.
func extractFrontmatterField(skillPath, field string) string {
	f, err := os.Open(filepath.Join(skillPath, skillFile))
	if err != nil {
		return ""
	}
	defer f.Close()
	return parseFrontmatterField(bufio.NewScanner(f), field)
}

func extractDescription(skillPath string) string {
	val := extractFrontmatterField(skillPath, "description")
	if val != "" {
		return val
	}
	if _, err := os.Stat(filepath.Join(skillPath, skillFile)); os.IsNotExist(err) {
		return "(no SKILL.md)"
	}
	return "(description not found)"
}

func extractVersion(skillPath string) string {
	return extractFrontmatterField(skillPath, "version")
}

func listSkills() []Skill {
	var skills []Skill

	for _, dir := range skillsDirs {
		entries, err := os.ReadDir(dir.path)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			// Ignore hidden directories (e.g. .git)
			if strings.HasPrefix(entry.Name(), ".") {
				continue
			}
			skillPath := filepath.Join(dir.path, entry.Name())
			skills = append(skills, Skill{
				Name:        entry.Name(),
				Path:        skillPath,
				Version:     extractVersion(skillPath),
				Description: extractDescription(skillPath),
				Source:      dir.label,
			})
		}
	}
	return skills
}

func printSkills(skills []Skill) {
	if len(skills) == 0 {
		fmt.Println("No skill installed.")
		return
	}

	fmt.Printf("\n%-35s %-10s %-15s %s\n", "NAME", "VERSION", "SOURCE", "DESCRIPTION")
	fmt.Println(strings.Repeat("─", 120))

	for _, s := range skills {
		ver := s.Version
		if ver == "" {
			ver = "—"
		}
		fmt.Printf("%-35s %-10s %-15s %s\n", s.Name, ver, s.Source, s.Description)
	}

	fmt.Printf("\n%d skill(s) installed.\n", len(skills))
}

func cmdList() {
	fmt.Println("Looking for installed skills...")
	skills := listSkills()
	printSkills(skills)
}

func findSkill(name string) *Skill {
	for _, s := range listSkills() {
		if s.Name == name {
			return &s
		}
	}
	return nil
}

func cmdUninstall(name string, force, all bool) {
	if all {
		skills := listSkills()
		if len(skills) == 0 {
			fmt.Println("No skill installed.")
			return
		}
		if !force {
			fmt.Printf("Confirm uninstallation of %d skill(s)? [y/N]: ", len(skills))
			var answer string
			fmt.Scanln(&answer)
			answer = strings.ToLower(strings.TrimSpace(answer))
			if answer != "y" && answer != "yes" {
				fmt.Println("Cancelled.")
				return
			}
		}
		m := loadMeta()
		removed := 0
		for _, s := range skills {
			if err := os.RemoveAll(s.Path); err != nil {
				fmt.Fprintf(os.Stderr, "  Removal error %s: %v\n", s.Name, err)
				continue
			}
			delete(m.Skills, s.Name)
			fmt.Printf("  %-35s uninstalled\n", s.Name)
			removed++
		}
		_ = saveMeta(m)
		fmt.Printf("\n%d skill(s) uninstalled.\n", removed)
		return
	}

	if name == "" {
		fmt.Fprintln(os.Stderr, "Usage: cli-skills uninstall <skill-name> | --all")
		os.Exit(1)
	}

	skill := findSkill(name)
	if skill == nil {
		fmt.Fprintf(os.Stderr, "Skill %q not found.\n", name)
		os.Exit(1)
	}

	fmt.Printf("Skill found: %s\n", skill.Path)

	if !force {
		fmt.Printf("Confirm deletion of %q? [y/N]: ", name)
		var answer string
		fmt.Scanln(&answer)
		answer = strings.ToLower(strings.TrimSpace(answer))
		if answer != "y" && answer != "yes" {
			fmt.Println("Cancelled.")
			return
		}
	}

	if err := os.RemoveAll(skill.Path); err != nil {
		fmt.Fprintf(os.Stderr, "Deletion error: %v\n", err)
		os.Exit(1)
	}
	m := loadMeta()
	delete(m.Skills, name)
	_ = saveMeta(m)
	fmt.Printf("Skill %q successfully uninstalled.\n", name)
}

// --- Application config ---

func cmdConfig(args []string) {
	if len(args) == 0 || args[0] != "local-repo" {
		fmt.Println("Usage: config local-repo [<path> | --reset]")
		return
	}
	// config local-repo (no argument) → show current value
	if len(args) == 1 {
		cfg := loadAppConfig()
		fmt.Printf("Current destination: %s\n", skillsDirs[0].path)
		if cfg.SkillsDir == "" {
			fmt.Println("  (default value)")
		}
		return
	}
	newPath := args[1]
	cfg := loadAppConfig()
	if newPath == "--reset" {
		cfg.SkillsDir = ""
		if err := saveAppConfig(cfg); err != nil {
			fmt.Fprintf(os.Stderr, "Config save error: %v\n", err)
			os.Exit(1)
		}
		reloadSkillsDirs()
		fmt.Printf("Destination reset: %s\n", skillsDirs[0].path)
		return
	}
	// Expand ~ to home directory
	if strings.HasPrefix(newPath, "~") {
		home, _ := os.UserHomeDir()
		newPath = filepath.Join(home, newPath[1:])
	}
	cfg.SkillsDir = newPath
	if err := saveAppConfig(cfg); err != nil {
		fmt.Fprintf(os.Stderr, "Config save error: %v\n", err)
		os.Exit(1)
	}
	reloadSkillsDirs()
	fmt.Printf("Destination updated: %s\n", skillsDirs[0].path)
}

// --- Windows console helpers ---

func consoleStdinHandle() syscall.Handle {
	h, _, _ := procGetStdHandle.Call(uintptr(stdInputHandle))
	return syscall.Handle(h)
}

func consoleStdoutHandle() syscall.Handle {
	h, _, _ := procGetStdHandle.Call(uintptr(stdOutputHandle))
	return syscall.Handle(h)
}

func getConsoleModeW(h syscall.Handle) (uint32, bool) {
	var mode uint32
	r, _, _ := procGetConsoleMode.Call(uintptr(h), uintptr(unsafe.Pointer(&mode)))
	return mode, r != 0
}

func setConsoleModeW(h syscall.Handle, mode uint32) {
	procSetConsoleMode.Call(uintptr(h), uintptr(mode))
}

// enableANSIOutput active le traitement des séquences VT100 sur la sortie standard (Windows 10+).
func enableANSIOutput() {
	h := consoleStdoutHandle()
	if m, ok := getConsoleModeW(h); ok {
		setConsoleModeW(h, m|enableProcessedOut|enableVTOutput)
	}
}

// isConsole rapporte si stdin est un terminal interactif.
func isConsole() bool {
	_, ok := getConsoleModeW(consoleStdinHandle())
	return ok
}

// readKeyVK bloque jusqu'au prochain événement "key down" et renvoie son virtual-key code.
func readKeyVK(h syscall.Handle) uint16 {
	var rec inputRecord
	var numRead uint32
	for {
		r, _, _ := procReadConsoleInputW.Call(
			uintptr(h),
			uintptr(unsafe.Pointer(&rec)),
			1,
			uintptr(unsafe.Pointer(&numRead)),
		)
		if r == 0 || numRead == 0 {
			continue
		}
		if rec.EventType != keyEventType {
			continue
		}
		if rec.KeyDown == 0 {
			continue // ignore key-up
		}
		return rec.VirtualKeyCode
	}
}

// selectFromList displays a keyboard-navigable list (↑↓ + Enter).
// Returns the selected index, or -1 if Escape is pressed.
// Falls back to numbered input if stdin is not a terminal.
func selectFromList(prompt string, options []string) int {
	fmt.Println(prompt)
	fmt.Println()

	if !isConsole() {
		for i, o := range options {
			fmt.Printf("  %d) %s\n", i+1, o)
		}
		fmt.Print("Your choice (number): ")
		sc := bufio.NewScanner(os.Stdin)
		if sc.Scan() {
			n, err := strconv.Atoi(strings.TrimSpace(sc.Text()))
			if err == nil && n >= 1 && n <= len(options) {
				return n - 1
			}
		}
		return -1
	}

	h := consoleStdinHandle()
	origMode, _ := getConsoleModeW(h)
	setConsoleModeW(h, origMode&^uint32(enableLineInput|enableEchoInput|enableProcessedIn))
	defer setConsoleModeW(h, origMode)

	selected := 0
	nOpts := len(options)

	render := func() {
		for i, opt := range options {
			if i == selected {
				fmt.Printf("\033[1;32m > %s\033[0m\n", opt)
			} else {
				fmt.Printf("   %s\n", opt)
			}
		}
	}
	clear := func() {
		for range options {
			fmt.Print("\033[1A\033[2K")
		}
	}

	render()
	for {
		vk := readKeyVK(h)
		clear()
		switch vk {
		case vkUp:
			if selected > 0 {
				selected--
			}
		case vkDown:
			if selected < nOpts-1 {
				selected++
			}
		case vkReturn:
			fmt.Printf("  \033[1m%s\033[0m\n\n", options[selected])
			return selected
		case vkEscape:
			fmt.Println()
			return -1
		}
		render()
	}
}

// selectYesNo asks a yes/no question with arrow-key navigation.
// Returns true for "yes", false for "no" or Escape.
func selectYesNo(prompt string) bool {
	return selectFromList(prompt, []string{"yes", "no"}) == 0
}

// --- Git config (no-exit version) ---

// tryGitConfig returns the Git config. Always succeeds for public GitHub repos.
func tryGitConfig() (GitConfig, bool) {
	baseURL := getEnv(envGitUrl, defaultGitUrl)
	token := getEnv(envGitToken, "")
	// For non-GitHub hosts, require a token
	if token == "" && !isGitHub(baseURL) {
		return GitConfig{}, false
	}
	project := getEnv(envGitProject, defaultGitProject)
	return GitConfig{
		token:   token,
		baseURL: baseURL,
		project: project,
	}, true
}

// --- Update check ---

type skillUpdate struct {
	skill     Skill
	remoteVer string
}

// checkUpdates compares local versions with remote versions.
// Prints a dot per checked skill. Returns the list of skills to update and the Git ref.
func checkUpdates(cfg GitConfig) (updates []skillUpdate, ref string) {
	ref, err := latestSemverTag(cfg.baseURL, cfg.project, cfg.token)
	if err != nil {
		return nil, ""
	}
	locals := listSkills()
	for _, s := range locals {
		rv := remoteSkillVersion(cfg, s.Name, ref)
		fmt.Print(".")
		if rv != "" && rv != s.Version {
			updates = append(updates, skillUpdate{skill: s, remoteVer: rv})
		}
	}
	if len(locals) > 0 {
		fmt.Println()
	}
	return updates, ref
}

// --- Interactive mode ---

func cmdInteractive() {
	enableANSIOutput()
	fmt.Printf("\n\033[1;36m  cli-skills v%s — Interactive Mode\033[0m\n", version)
	fmt.Printf("  Type a command or 'help'. Quit with 'exit'.\n\n")

	var (
		remoteSkillItems []readline.PrefixCompleterInterface
		localSkillItems  []readline.PrefixCompleterInterface
	)

	if cfg, ok := tryGitConfig(); ok {
		fmt.Print("  Checking for updates")
		updates, ref := checkUpdates(cfg)
		// Liste complète des skills distants pour l'autocomplétion de 'install'
		if ref != "" {
			if names, err := remoteSkillsAtRef(cfg.baseURL, cfg.project, cfg.token, ref); err == nil {
				for _, n := range names {
					remoteSkillItems = append(remoteSkillItems, readline.PcItem(n))
				}
			}
		}
		if len(updates) > 0 {
			fmt.Printf("\n  \033[33m%d skill(s) can be updated:\033[0m\n", len(updates))
			for _, u := range updates {
				lv := u.skill.Version
				if lv == "" {
					lv = "unknown"
				}
				fmt.Printf("    \033[33m%-35s\033[0m v%s → v%s\n", u.skill.Name, lv, u.remoteVer)
			}
			fmt.Println()
			if selectYesNo("  Would you like to update them?") {
				m := loadMeta()
				for _, u := range updates {
					fmt.Printf("  Updating %-35s", u.skill.Name)
					if err := os.RemoveAll(u.skill.Path); err != nil {
						fmt.Fprintf(os.Stderr, "\033[31mERROR\033[0m: %v\n", err)
						continue
					}
					if err := downloadSkill(cfg, u.skill.Name, ref, u.skill.Path); err != nil {
						fmt.Fprintf(os.Stderr, "\033[31mERROR\033[0m: %v\n", err)
						continue
					}
					if nv := extractVersion(u.skill.Path); nv != "" {
						m.Skills[u.skill.Name] = nv
					} else {
						m.Skills[u.skill.Name] = ref
					}
					fmt.Printf("\033[32m✓ v%s\033[0m\n", u.remoteVer)
				}
				if err := saveMeta(m); err != nil {
					fmt.Fprintf(os.Stderr, "  Warning: metadata not saved: %v\n", err)
				}
				fmt.Println()
			}
		} else {
			fmt.Println("\n  All skills are up to date.")
			fmt.Println()
		}
	} else {
		fmt.Println("  (GIT_TOKEN not set — automatic updates are disabled)")
		fmt.Println()
	}

	// Skills locaux pour l'autocomplétion de 'uninstall' et 'update'
	for _, s := range listSkills() {
		localSkillItems = append(localSkillItems, readline.PcItem(s.Name))
	}

	// Boucle REPL avec autocomplétion
	mc := &mutableCompleter{current: buildCompleter(remoteSkillItems, localSkillItems)}
	rl, err := readline.NewEx(&readline.Config{
		Prompt:          "\033[1;36mcli-skills\033[0m> ",
		AutoComplete:    mc,
		HistoryLimit:    100,
		InterruptPrompt: "^C",
		EOFPrompt:       "exit",
	})
	if err != nil {
		// Fall back to bufio.Scanner if readline cannot initialise
		sc := bufio.NewScanner(os.Stdin)
		for {
			fmt.Print("\033[1;36mcli-skills\033[0m> ")
			if !sc.Scan() {
				break
			}
			replDispatch(strings.Fields(strings.TrimSpace(sc.Text())), nil, remoteSkillItems)
		}
		return
	}
	defer rl.Close()
	for {
		line, err := rl.Readline()
		if err == readline.ErrInterrupt {
			if strings.TrimSpace(line) == "" {
				break
			}
			continue
		}
		if err == io.EOF {
			break
		}
		replDispatch(strings.Fields(strings.TrimSpace(line)), mc, remoteSkillItems)
	}
	fmt.Println("Goodbye!")
}

// mutableCompleter implements readline.AutoCompleter with hot-swappable content.
type mutableCompleter struct{ current readline.AutoCompleter }

func (m *mutableCompleter) Do(line []rune, pos int) ([][]rune, int) {
	return m.current.Do(line, pos)
}

// buildCompleter builds the REPL AutoCompleter from the remote and local skill lists.
func buildCompleter(remoteSkillItems, localSkillItems []readline.PrefixCompleterInterface) readline.AutoCompleter {
	return readline.NewPrefixCompleter(
		readline.PcItem("list"),
		readline.PcItem("ls"),
		readline.PcItem("catalog"),
		readline.PcItem("search"),
		readline.PcItem("install",
			append([]readline.PrefixCompleterInterface{readline.PcItem("--all")}, remoteSkillItems...)...,
		),
		readline.PcItem("update",
			append([]readline.PrefixCompleterInterface{readline.PcItem("--all")}, localSkillItems...)...,
		),
		readline.PcItem("uninstall",
			append([]readline.PrefixCompleterInterface{readline.PcItem("--all")}, localSkillItems...)...,
		),
		readline.PcItem("remove",
			append([]readline.PrefixCompleterInterface{readline.PcItem("--all")}, localSkillItems...)...,
		),
		readline.PcItem("config",
			readline.PcItem("dist", readline.PcItem("--reset")),
		),
		readline.PcItem("version"),
		readline.PcItem("help"),
		readline.PcItem("exit"),
		readline.PcItem("quit"),
	)
}

// refreshLocalCompleter re-reads listSkills() and updates the mutable completer content.
// No-op if mc is nil (bufio.Scanner fallback path).
func refreshLocalCompleter(mc *mutableCompleter, remoteSkillItems []readline.PrefixCompleterInterface) {
	if mc == nil {
		return
	}
	var localItems []readline.PrefixCompleterInterface
	for _, s := range listSkills() {
		localItems = append(localItems, readline.PcItem(s.Name))
	}
	mc.current = buildCompleter(remoteSkillItems, localItems)
}

// replDispatch exécute une commande REPL à partir de ses tokens.
func replDispatch(parts []string, mc *mutableCompleter, remoteSkillItems []readline.PrefixCompleterInterface) {
	if len(parts) == 0 {
		return
	}
	switch parts[0] {
	case "exit", "quit", "q":
		fmt.Println("Goodbye!")
		os.Exit(0)
	case "list", "ls":
		cmdList()
	case "catalog":
		cmdCatalog()
	case "search":
		query := ""
		if len(parts) > 1 {
			query = strings.Join(parts[1:], " ")
		}
		cmdSearch(query)
	case "install":
		allFlag := false
		name := ""
		for _, a := range parts[1:] {
			if a == "--all" || a == "-a" {
				allFlag = true
			} else {
				name = a
			}
		}
		if !allFlag && name == "" {
			fmt.Fprintln(os.Stderr, "Usage: install <name> | --all")
		} else {
			cmdInstall(name, allFlag)
			refreshLocalCompleter(mc, remoteSkillItems)
		}
	case "update":
		allFlag := false
		name := ""
		for _, a := range parts[1:] {
			if a == "--all" || a == "-a" {
				allFlag = true
			} else {
				name = a
			}
		}
		if !allFlag && name == "" {
			fmt.Fprintln(os.Stderr, "Usage: update <name> | --all")
		} else {
			cmdUpdate(name, allFlag)
		}
	case "uninstall", "remove", "rm":
		force := false
		all := false
		name := ""
		for _, a := range parts[1:] {
			switch a {
			case "-y", "--yes":
				force = true
			case "--all", "-a":
				all = true
			default:
				name = a
			}
		}
		cmdUninstall(name, force, all)
		refreshLocalCompleter(mc, remoteSkillItems)
	case "config":
		cmdConfig(parts[1:])
		refreshLocalCompleter(mc, remoteSkillItems)
	case "version":
		cmdVersion()
	case "aide", "help", "?":
		cmdHelp("")
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %q. Type 'help'.\n", parts[0])
	}
}

func cmdHelp(prefix string) {
	fmt.Printf("cli-skills %s — AI Skills Manager for VSCode\n\n", version)
	fmt.Println("Usage:")
	if prefix == "" {
		// Interactive mode header
		fmt.Println("  (interactive mode — type the command directly without prefix)")
		fmt.Println()
	}
	fmt.Printf("  %-42s Lists locally installed skills\n", prefix+"list")
	fmt.Printf("  %-42s Lists skills available on Git\n", prefix+"catalog")
	fmt.Printf("  %-42s Searches skills by name in the catalog\n", prefix+"search <query>")
	fmt.Printf("  %-42s Installs a skill from Git\n", prefix+"install <name>")
	fmt.Printf("  %-42s Installs all skills from Git\n", prefix+"install --all")
	fmt.Printf("  %-42s Updates an installed skill\n", prefix+"update <name>")
	fmt.Printf("  %-42s Updates all installed skills\n", prefix+"update --all")
	fmt.Printf("  %-42s Uninstalls a skill\n", prefix+"uninstall <name>")
	fmt.Printf("  %-42s Uninstalls all skills\n", prefix+"uninstall --all")
	fmt.Printf("  %-42s Shows/sets the installation directory\n", prefix+"config local-repo [<path>]")
	fmt.Printf("  %-42s Resets the installation directory\n", prefix+"config local-repo --reset")
	fmt.Printf("  %-42s Displays the binary version\n", prefix+"version")
	fmt.Printf("  %-42s Displays this help\n", prefix+"help")
	if prefix != "" {
		// Only relevant in CLI mode
		fmt.Printf("  %-42s Launches interactive mode (REPL + update check)\n", prefix[:len(prefix)-1])
	}
	fmt.Println()
	fmt.Println("Analyzed directories:")
	for _, d := range skillsDirs {
		fmt.Printf("  [%s] %s\n", d.label, d.path)
	}
}

func main() {
	if len(os.Args) < 2 {
		cmdInteractive()
		return
	}

	switch os.Args[1] {
	case "list":
		cmdList()

	case "catalog":
		cmdCatalog()

	case "search":
		query := ""
		if len(os.Args) > 2 {
			query = strings.Join(os.Args[2:], " ")
		}
		cmdSearch(query)

	case "install":
		allFlag := false
		name := ""
		for _, arg := range os.Args[2:] {
			if arg == "--all" || arg == "-a" {
				allFlag = true
			} else {
				name = arg
			}
		}
		cmdInstall(name, allFlag)

	case "update":
		all := false
		name := ""
		for _, arg := range os.Args[2:] {
			if arg == "--all" || arg == "-a" {
				all = true
			} else {
				name = arg
			}
		}
		if !all && name == "" {
			fmt.Fprintln(os.Stderr, "Usage: cli-skills update <name> | --all")
			os.Exit(1)
		}
		cmdUpdate(name, all)

	case "uninstall", "remove", "rm", "-d", "-u":
		force := false
		all := false
		name := ""
		for _, arg := range os.Args[2:] {
			switch arg {
			case "-y", "--yes":
				force = true
			case "--all", "-a":
				all = true
			default:
				name = arg
			}
		}
		cmdUninstall(name, force, all)

	case "config":
		cmdConfig(os.Args[2:])

	case "version", "--version", "-v":
		cmdVersion()

	case "help", "--help", "-h":
		cmdHelp("cli-skills ")

	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %q\n\n", os.Args[1])
		cmdHelp("cli-skills ")
		os.Exit(1)
	}
}
