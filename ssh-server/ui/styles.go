package ui

import "github.com/charmbracelet/lipgloss"

// Colour palette
var (
	colorPrimary   = lipgloss.Color("#7C3AED") // purple
	colorSecondary = lipgloss.Color("#06B6D4") // cyan
	colorMuted     = lipgloss.Color("#6B7280") // grey
	colorText      = lipgloss.Color("#E5E7EB") // light grey
	colorHighlight = lipgloss.Color("#F59E0B") // amber
	colorBorder    = lipgloss.Color("#374151") // dark grey
)

// Styles
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(colorPrimary).
			MarginBottom(1)

	nameStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(colorPrimary)

	taglineStyle = lipgloss.NewStyle().
			Foreground(colorSecondary).
			Italic(true)

	locationStyle = lipgloss.NewStyle().
			Foreground(colorMuted)

	sectionTitleStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(colorHighlight).
				MarginTop(1).
				MarginBottom(1).
				BorderStyle(lipgloss.NormalBorder()).
				BorderBottom(true).
				BorderForeground(colorBorder)

	bodyStyle = lipgloss.NewStyle().
			Foreground(colorText)

	linkLabelStyle = lipgloss.NewStyle().
			Foreground(colorSecondary).
			Bold(true).
			Width(12)

	linkURLStyle = lipgloss.NewStyle().
			Foreground(colorMuted)

	projectNameStyle = lipgloss.NewStyle().
				Foreground(colorPrimary).
				Bold(true)

	projectDescStyle = lipgloss.NewStyle().
				Foreground(colorText)

	projectURLStyle = lipgloss.NewStyle().
			Foreground(colorMuted).
			Italic(true)

	jobCompanyStyle = lipgloss.NewStyle().
			Foreground(colorSecondary).
			Bold(true)

	jobRoleStyle = lipgloss.NewStyle().
			Foreground(colorText)

	jobTypeStyle = lipgloss.NewStyle().
			Foreground(colorMuted).
			Italic(true)

	currentBadgeStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#10B981")).
				Bold(true)

	footerStyle = lipgloss.NewStyle().
			Foreground(colorMuted).
			MarginTop(1)

	tabStyle = lipgloss.NewStyle().
			Foreground(colorMuted).
			Padding(0, 2)

	activeTabStyle = lipgloss.NewStyle().
			Foreground(colorPrimary).
			Bold(true).
			Padding(0, 2).
			BorderStyle(lipgloss.NormalBorder()).
			BorderBottom(true).
			BorderForeground(colorPrimary)

	containerStyle = lipgloss.NewStyle().
			Padding(1, 2)
)
