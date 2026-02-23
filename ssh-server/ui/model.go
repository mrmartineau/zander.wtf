package ui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/ssh"
)

// Tabs
var tabs = []string{"About", "Projects", "Experience", "Links"}

// Model is the Bubble Tea model for the SSH TUI.
type Model struct {
	width     int
	height    int
	activeTab int
	viewport  viewport.Model
	ready     bool
}

// TeaHandler returns a new Bubble Tea program for each SSH session.
func TeaHandler(s ssh.Session) (tea.Model, []tea.ProgramOption) {
	pty, _, _ := s.Pty()
	m := Model{
		width:  pty.Window.Width,
		height: pty.Window.Height,
	}
	return m, []tea.ProgramOption{tea.WithAltScreen(), tea.WithMouseCellMotion()}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c", "esc":
			return m, tea.Quit
		case "tab", "right", "l":
			m.activeTab = (m.activeTab + 1) % len(tabs)
			m.updateViewport()
		case "shift+tab", "left", "h":
			m.activeTab = (m.activeTab - 1 + len(tabs)) % len(tabs)
			m.updateViewport()
		}
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		if !m.ready {
			m.viewport = viewport.New(msg.Width-4, msg.Height-10)
			m.ready = true
		} else {
			m.viewport.Width = msg.Width - 4
			m.viewport.Height = msg.Height - 10
		}
		m.updateViewport()
	}

	m.viewport, cmd = m.viewport.Update(msg)
	return m, cmd
}

func (m *Model) updateViewport() {
	var content string
	switch m.activeTab {
	case 0:
		content = m.renderAbout()
	case 1:
		content = m.renderProjects()
	case 2:
		content = m.renderExperience()
	case 3:
		content = m.renderLinks()
	}
	m.viewport.SetContent(content)
	m.viewport.GotoTop()
}

func (m Model) View() string {
	if !m.ready {
		return "Loading..."
	}

	header := m.renderHeader()
	tabBar := m.renderTabs()
	footer := m.renderFooter()
	body := m.viewport.View()

	page := lipgloss.JoinVertical(
		lipgloss.Left,
		header,
		tabBar,
		body,
		footer,
	)

	return containerStyle.Render(page)
}

// renderHeader renders the top banner with name and tagline.
func (m Model) renderHeader() string {
	banner := `
 ____   __   __ _  ____  ____  ____
(__  ) / _\ (  ( \(    \(  __)(  _ \
 / _/ /    \/    / ) D ( ) _)  )   /
(____) \_/\_/\_)__)(____(____)(__ \_)`

	name := nameStyle.Render(banner)
	tagline := taglineStyle.Render(TagLine)
	location := locationStyle.Render("  " + Location)

	return lipgloss.JoinVertical(lipgloss.Left, name, tagline+location, "")
}

// renderTabs renders the tab bar.
func (m Model) renderTabs() string {
	var renderedTabs []string
	for i, t := range tabs {
		if i == m.activeTab {
			renderedTabs = append(renderedTabs, activeTabStyle.Render(t))
		} else {
			renderedTabs = append(renderedTabs, tabStyle.Render(t))
		}
	}
	return lipgloss.JoinHorizontal(lipgloss.Bottom, renderedTabs...) + "\n"
}

// renderAbout renders the About tab content.
func (m Model) renderAbout() string {
	title := sectionTitleStyle.Render("About Me")
	bio := bodyStyle.Render(Bio)
	website := "\n" + linkLabelStyle.Render("Web") + linkURLStyle.Render(Website)
	email := linkLabelStyle.Render("Email") + linkURLStyle.Render(Email)

	return lipgloss.JoinVertical(lipgloss.Left, title, bio, website, email)
}

// renderProjects renders the Projects tab content.
func (m Model) renderProjects() string {
	title := sectionTitleStyle.Render("Projects")
	var items []string
	for _, p := range Projects {
		name := projectNameStyle.Render(p.Name)
		desc := projectDescStyle.Render("  " + p.Description)
		url := projectURLStyle.Render("  " + p.URL)
		items = append(items, fmt.Sprintf("%s\n%s\n%s", name, desc, url))
	}
	return title + "\n" + strings.Join(items, "\n\n")
}

// renderExperience renders the Experience tab content.
func (m Model) renderExperience() string {
	title := sectionTitleStyle.Render("Experience")

	current := fmt.Sprintf(
		"%s %s  %s  %s",
		currentBadgeStyle.Render("*"),
		jobCompanyStyle.Render(CurrentJob.Company),
		jobRoleStyle.Render(CurrentJob.Role),
		jobTypeStyle.Render("("+CurrentJob.Type+")"),
	)

	var previous []string
	for _, j := range PreviousJobs {
		line := fmt.Sprintf(
			"  %s  %s  %s",
			jobCompanyStyle.Render(j.Company),
			jobRoleStyle.Render(j.Role),
			jobTypeStyle.Render("("+j.Type+")"),
		)
		previous = append(previous, line)
	}

	return title + "\n" + current + "\n" + strings.Join(previous, "\n")
}

// renderLinks renders the Links tab content.
func (m Model) renderLinks() string {
	title := sectionTitleStyle.Render("Links")
	var items []string
	for _, l := range Links {
		label := linkLabelStyle.Render(l.Label)
		url := linkURLStyle.Render(l.URL)
		items = append(items, label+url)
	}
	return title + "\n" + strings.Join(items, "\n")
}

// renderFooter renders the bottom help bar.
func (m Model) renderFooter() string {
	return footerStyle.Render("  tab/arrows: switch sections  |  scroll: up/down  |  q/esc: quit")
}

