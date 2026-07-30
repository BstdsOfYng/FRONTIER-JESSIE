from github import Github
import logging
import os
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitHubClient:
    """
    Handles interactions with GitHub to apply fixes and comment on PRs.
    """
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        if not self.token:
            raise ValueError("GITHUB_TOKEN must be provided or set in environment.")
        self.gh = Github(self.token)

    def apply_fix(self, repo_name: str, branch: str, file_path: str, content: str, commit_message: str):
        """
        Updates a file on a specific branch.
        """
        try:
            repo = self.gh.get_repo(repo_name)
            contents = repo.get_contents(file_path, ref=branch)
            
            repo.update_file(
                path=file_path,
                message=commit_message,
                content=content,
                sha=contents.sha,
                branch=branch
            )
            logger.info(f"Successfully updated {file_path} on branch {branch}")
        except Exception as e:
            logger.error(f"Error applying fix to GitHub: {e}")
            raise

    def post_pr_comment(self, repo_name: str, pr_number: int, message: str):
        """
        Posts a comment to a Pull Request.
        """
        try:
            repo = self.gh.get_repo(repo_name)
            pr = repo.get_pull(pr_number)
            pr.create_issue_comment(message)
            logger.info(f"Posted comment to PR #{pr_number}")
        except Exception as e:
            logger.error(f"Error posting PR comment: {e}")
            raise
