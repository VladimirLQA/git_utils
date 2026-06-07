alias gs='git status'
alias gp='git pull'
alias gph='git push'
alias gd='git diff | mate'
alias gau='git add'
alias gcm='git commit -m'
alias gca='git commit -a'
alias gb='git branch'
alias gba='git branch -a'
alias gco='git checkout'
alias gcob='git checkout -b'
alias glog='git log --pretty=format:"%h %s" --graph'
alias gfo='git fetch origin'
alias gsts='git stash show'
alias gstp='git stash pop'
alias gsta='git stash apply'

export EDITOR='nvim'

help_t() {
	cat <<EOF
	Usage: t [OPTION] [ARGUMENT]

	Options:
	  -c <test_id>    Run specific test case by ID
	  -s <spec_file>  Run specific spec file(s)
	  -h              Display help message

	Examples:
	  t -c 10000001
	  t -s "specs/test/ui,spec/t/find.ts"

EOF
}

t() {
	local FLAG="$1"
	local TEST_TO_RUN="$2"

	if [[ -z "$FLAG" ]]; then
		echo "Error: No option provided" >&2
		help_t
		return 1
	fi

	if [[ "$FLAG" != "-h" && -z "$TEST_TO_RUN" ]]; then
		echo "Error: Option '$FLAG' requires argument" >&2
		help_t
		return 1
	fi

	case "$FLAG" in
	-s) npm run test -- --specs="$TEST_TO_RUN" ;;
	-c) npm run test:case "$TEST_TO_RUN" ;;
	-h)
		help_t
		return 0
		;;
	*)
		echo "Error: Invalid option '$FLAG'" >&2
		help_t
		return 1
		;;
	esac
}
# test remote

gpsh() {
  local BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || return 1
  [[ -z "$BRANCH" ]] && { echo "Not on any branch"; return 1; }
  [[ "$BRANCH" = "master" ]] && { echo "Push to master is FORBIDDEN. Create a branch, BIRDBRAIN!"; return 1; }

  local -a OPTS=(origin "$BRANCH")

  if ! git ls-remote --exit-code origin "$BRANCH" >/dev/null 2>&1; then
    OPTS=(--set-upstream origin "$BRANCH")
  fi

  local force_pattern="^(f|\-f)$"
 
  [[ "$1" =~ $force_pattern ]] && OPTS+=(--force-with-lease)
 
  git push "${OPTS[@]}"
}
