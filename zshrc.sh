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

gpsh() {
  local BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || return 1
  [[ -z "$BRANCH" ]] && { echo "Not on any branch"; return 1; }

  local branch_name_pattern="(master|main)"
  [[ "$BRANCH" =~ $branch_name_pattern ]] && { echo "Push to master/main is FORBIDDEN. Create a branch, BIRDBRAIN!"; return 1; }

  local -a OPTS=(origin "$BRANCH")

  if ! git ls-remote --exit-code origin "$BRANCH" >/dev/null 2>&1; then
    OPTS=(--set-upstream origin "$BRANCH")
  fi

  local force_pattern="^(f|\-f)$"
 
  [[ "$1" =~ $force_pattern ]] && OPTS+=(--force-with-lease)
 
  git push "${OPTS[@]}"
}

trim_str() {
    local var="$1"
    
    # Trim leading whitespace
    var="${var##+([[:space:]])}"
    
    # Trim trailing whitespace
    var="${var%%+([[:space:]])}"
    
    printf '%s' "$var"
}

gcm() {

	local COMMIT_TYPE SCOPE MESSAGE TRIMMED_MESSAGE FULL_MESSAGE
	local -a COMMIT_TYPES=("test" "fix" "chore" "refactor" "docs" "style")

	echo "Select commit type: "
	select COMMIT_TYPE in "${COMMIT_TYPES[@]}"; do
	  if [[ -n "$COMMIT_TYPE" ]]; then
	    break
          else
	    echo "Invalid selection. Please try again."
	  fi
	done

	local BRANCH_NAME=$(git branch --show-current 2>/dev/null)
	local TICKET=""
        [[ "$BRANCH_NAME" =~ / ]] && TICKET="${BRANCH_NAME#*/}"

    	local -a SCOPES=("branch" "e2e" "testcases" "api" "omitted")
   	echo "Select commit scope:"
    	select SCOPE in "${SCOPES[@]}"; do
	  case "$SCOPE" in
	    "branch")    SCOPE="(${TICKET})" ;;
	    "e2e")       SCOPE="(e2e)" ;;
	    "testcases") SCOPE="(testcases)" ;;
	    "api")       SCOPE="(api)" ;;
	    "omitted")   SCOPE="" ;;
	    *)           echo "Invalid scope selection."; continue ;;
	  esac
	  break
	done

	# ==================== COMMIT MESSAGE ====================
	echo "Enter commit message (minimum 5 characters):"
	read -r MESSAGE

	TRIMMED_MESSAGE=$(trim_str "$MESSAGE")
	if [[ -z "$TRIMMED_MESSAGE" || ${#TRIMMED_MESSAGE} -lt 5 ]]; then
	  echo "Error: Commit message must be at least 5 characters long and non-empty."
	  return 1
	fi

	# Build conventional commit message
	    if [[ -n "$SCOPE" ]]; then
		FULL_MESSAGE="${COMMIT_TYPE}${SCOPE}: ${TRIMMED_MESSAGE}"
	    else
		FULL_MESSAGE="${COMMIT_TYPE}: ${TRIMMED_MESSAGE}"
	    fi

	# ==================== VALIDATION ====================
	local REGEX='^(revert: )?((feat|fix|docs|style|refactor|perf|test|chore)(\([^)]+\))?: .{5,})'
	    
	if ! [[ "$FULL_MESSAGE" =~ $REGEX ]]; then
	  echo "Error: Commit message does not follow Conventional Commits format."
	  echo "Expected format: type[(scope)]: message"
	  echo "Your message : $FULL_MESSAGE"
	  return 1
	fi

	# ==================== EXECUTE COMMIT ====================
	echo "Committing with message:"
	echo "   $FULL_MESSAGE"
	git commit -m "$FULL_MESSAGE"
}
