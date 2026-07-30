import docker
import logging
from typing import Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DockerSandbox:
    """
    Provides an ephemeral Docker environment to reproduce CI failures.
    """
    def __init__(self, image: str = "python:3.10-slim"):
        self.client = docker.from_env()
        self.image = image

    def reproduce_error(self, repo_url: str, branch: str, test_command: str) -> Tuple[int, str]:
        """
        Clones the PR branch and executes the test command.
        Returns (exit_code, logs).
        """
        container = None
        try:
            logger.info(f"Creating sandbox for branch {branch}...")
            # Setup basic clone and run command
            setup_cmd = (
                f"apt-get update && apt-get install -y git && "
                f"git clone -b {branch} {repo_url} /app && "
                f"cd /app && {test_command}"
            )

            container = self.client.containers.run(
                image=self.image,
                command=["sh", "-c", setup_cmd],
                working_dir="/app",
                detach=False,
                remove=True,
                stderr=True
            )
            
            # If run finishes without exception, it succeeded (which means the bug is gone)
            return 0, container.decode('utf-8')

        except docker.errors.ContainerError as e:
            logger.info("Reproduction successful: Error captured.")
            return e.exit_status, e.stderr.decode('utf-8')
        except Exception as e:
            logger.error(f"Unexpected sandbox error: {e}")
            return -1, str(e)
        finally:
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass
