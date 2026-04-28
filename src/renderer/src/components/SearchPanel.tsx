import { useState, useMemo, useCallback } from 'react'

interface SearchPanelProps {
  width: number
  content: string
  onFileSelect?: (path: string) => void
  onReplace?: (original: string, replacement: string) => void
  onNavigateToLine?: (lineNumber: number) => void
}

interface SearchMatch {
  line: number
  text: string
  highlightStart: number
  highlightEnd: number
}

interface SearchResult {
  fileName: string
  filePath: string
  matches: SearchMatch[]
}

export default function SearchPanel({
  width,
  content,
  onFileSelect,
  onReplace,
  onNavigateToLine
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [isWholeWord, setIsWholeWord] = useState(false)
  const [isRegex, setIsRegex] = useState(false)
  const [isReplaceOpen, setIsReplaceOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Parse content into lines
  const lines = useMemo(() => {
    return content.split('\n')
  }, [content])

  // Perform search based on current settings
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) {
      return []
    }

    const matches: SearchMatch[] = []

    try {
      // Build regex pattern based on settings
      let pattern: string
      let flags = 'g'

      if (isRegex) {
        // Use the query directly as regex
        pattern = searchQuery
      } else {
        // Escape special regex characters
        pattern = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }

      // Add word boundaries for whole word search
      if (isWholeWord) {
        pattern = `\\b${pattern}\\b`
      }

      // Add case insensitive flag if not case sensitive
      if (!isCaseSensitive) {
        flags += 'i'
      }

      const regex = new RegExp(pattern, flags)

      lines.forEach((line, index) => {
        const lineMatches: SearchMatch[] = []
        let match: RegExpExecArray | null
        const lineRegex = new RegExp(pattern, flags)

        // Reset lastIndex for each line
        lineRegex.lastIndex = 0

        // Find all matches in this line
        while ((match = lineRegex.exec(line)) !== null) {
          // Prevent infinite loop on zero-width matches
          if (match.index === lineRegex.lastIndex) {
            lineRegex.lastIndex++
            continue
          }

          lineMatches.push({
            line: index + 1,
            text: line,
            highlightStart: match.index,
            highlightEnd: match.index + match[0].length
          })
        }

        matches.push(...lineMatches)
      })
    } catch (error) {
      // Invalid regex, return empty results
      console.error('Invalid regex pattern:', error)
      return []
    }

    // Group matches into a single result (since we're searching current file only)
    if (matches.length > 0) {
      return [{
        fileName: 'Current File',
        filePath: 'current',
        matches
      }]
    }

    return []
  }, [searchQuery, lines, isCaseSensitive, isWholeWord, isRegex])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    setHasSearched(value.length > 0)
  }, [])

  const handleFileClick = useCallback((path: string) => {
    if (onFileSelect) {
      onFileSelect(path)
    }
  }, [onFileSelect])

  const handleMatchClick = useCallback((lineNumber: number) => {
    if (onNavigateToLine) {
      onNavigateToLine(lineNumber)
    }
  }, [onNavigateToLine])

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery || !onReplace) return

    try {
      let pattern: string
      let flags = 'g'

      if (isRegex) {
        pattern = searchQuery
      } else {
        pattern = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }

      if (isWholeWord) {
        pattern = `\\b${pattern}\\b`
      }

      if (!isCaseSensitive) {
        flags += 'i'
      }

      const regex = new RegExp(pattern, flags)
      onReplace(searchQuery, replaceQuery)
    } catch (error) {
      console.error('Replace failed:', error)
    }
  }, [searchQuery, replaceQuery, isRegex, isWholeWord, isCaseSensitive, onReplace])

  const totalMatches = searchResults.reduce((sum, result) => sum + result.matches.length, 0)
  const totalFiles = searchResults.length

  const renderHighlightedText = (text: string, start: number, end: number) => {
    // Truncate long lines for display
    const maxLength = 80
    let displayText = text
    let displayStart = start
    let displayEnd = end

    if (text.length > maxLength) {
      const matchLength = end - start
      const contextLength = Math.floor((maxLength - matchLength) / 2)

      let sliceStart = Math.max(0, start - contextLength)
      let sliceEnd = Math.min(text.length, end + contextLength)

      // Adjust if we're at the beginning or end
      if (sliceStart === 0) {
        sliceEnd = Math.min(text.length, maxLength)
      } else if (sliceEnd === text.length) {
        sliceStart = Math.max(0, text.length - maxLength)
      }

      displayText = (sliceStart > 0 ? '...' : '') +
                    text.slice(sliceStart, sliceEnd) +
                    (sliceEnd < text.length ? '...' : '')
      displayStart = start - sliceStart + (sliceStart > 0 ? 3 : 0)
      displayEnd = displayStart + matchLength
    }

    return (
      <>
        {displayText.slice(0, displayStart)}
        <span className="search-panel-highlight">{displayText.slice(displayStart, displayEnd)}</span>
        {displayText.slice(displayEnd)}
      </>
    )
  }

  return (
    <div className="search-panel" style={{ width, minWidth: width }}>
      {/* Header */}
      <div className="search-panel-header">
        <svg className="search-panel-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="search-panel-title">搜索</span>
      </div>

      {/* Search Input */}
      <div className="search-panel-input-wrapper">
        <div className="search-panel-input-container">
          <svg className="search-panel-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-panel-input"
            placeholder="搜索文件内容..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-panel-clear-btn"
              onClick={() => handleSearch('')}
              title="清除"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="search-panel-filters">
        <button
          className={`search-panel-filter-btn ${isCaseSensitive ? 'active' : ''}`}
          onClick={() => setIsCaseSensitive(!isCaseSensitive)}
          title="区分大小写"
        >
          Aa
        </button>
        <button
          className={`search-panel-filter-btn ${isWholeWord ? 'active' : ''}`}
          onClick={() => setIsWholeWord(!isWholeWord)}
          title="全词匹配"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <button
          className={`search-panel-filter-btn ${isRegex ? 'active' : ''}`}
          onClick={() => setIsRegex(!isRegex)}
          title="正则表达式"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            <path d="M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" />
          </svg>
        </button>
      </div>

      {/* Results Section */}
      <div className="search-panel-results">
        {hasSearched ? (
          totalMatches > 0 ? (
            <>
              <div className="search-panel-results-header">
                <span className="search-panel-results-title">搜索结果</span>
                <span className="search-panel-results-count">({totalFiles} 个文件, {totalMatches} 处匹配)</span>
              </div>

              <div className="search-panel-results-list">
                {searchResults.map((result, resultIndex) => (
                  <div key={resultIndex} className="search-panel-result-group">
                    <div
                      className="search-panel-result-file"
                      onClick={() => handleFileClick(result.filePath)}
                    >
                      <svg className="search-panel-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div className="search-panel-file-info">
                        <span className="search-panel-file-name">{result.fileName}</span>
                        <span className="search-panel-file-path">{result.matches.length} 处匹配</span>
                      </div>
                    </div>
                    <div className="search-panel-matches">
                      {result.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="search-panel-match-item"
                          onClick={() => handleMatchClick(match.line)}
                        >
                          <span className="search-panel-match-line">{match.line}</span>
                          <span className="search-panel-match-text">
                            {renderHighlightedText(match.text, match.highlightStart, match.highlightEnd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="search-panel-empty">
              <svg className="search-panel-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M8 11h6" strokeLinecap="round" />
              </svg>
              <span className="search-panel-empty-text">未找到匹配结果</span>
            </div>
          )
        ) : (
          <div className="search-panel-empty">
            <svg className="search-panel-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" strokeLinecap="round" />
            </svg>
            <span className="search-panel-empty-text">输入关键词开始搜索</span>
          </div>
        )}
      </div>

      {/* Replace Section */}
      <div className="search-panel-replace-section">
        <button
          className="search-panel-replace-toggle"
          onClick={() => setIsReplaceOpen(!isReplaceOpen)}
        >
          <svg
            className={`search-panel-replace-arrow ${isReplaceOpen ? 'open' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>替换</span>
        </button>

        {isReplaceOpen && (
          <div className="search-panel-replace-content">
            <div className="search-panel-replace-input-wrapper">
              <input
                type="text"
                className="search-panel-replace-input"
                placeholder="替换为..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
              />
            </div>
            <button
              className="search-panel-replace-all-btn"
              disabled={!searchQuery || !onReplace}
              onClick={handleReplaceAll}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                <path d="M8 8l8 8M16 8l-8 8" />
              </svg>
              <span>全部替换</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
