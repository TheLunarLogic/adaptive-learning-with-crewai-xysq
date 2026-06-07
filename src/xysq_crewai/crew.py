"""CrewAI crew definitions for the adaptive learning system.

Two crews with separate task configs to avoid agent resolution conflicts:
  • LearningCrew   — tutor teaches + quiz master generates questions
  • AssessmentCrew — quiz master evaluates + progress analyst reports
"""

from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent


@CrewBase
class LearningCrew:
    """Teach a topic and generate an adaptive quiz."""

    agents_config = "config/agents.yaml"
    tasks_config = "config/learning_tasks.yaml"

    agents: list[BaseAgent]
    tasks: list[Task]
    credentials: dict | None = None

    def __init__(self, credentials: dict):
        self.credentials = credentials

    def _get_llm(self) -> LLM:
        if not self.credentials:
            raise ValueError("Credentials not provided to LearningCrew")
        
        provider = self.credentials.get("PROVIDER", "")
        model = self.credentials.get("MODEL", "")
        
        if provider == "AWS Bedrock":
            return LLM(
                model=model,
                aws_access_key_id=self.credentials.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=self.credentials.get("AWS_SECRET_ACCESS_KEY"),
                aws_region_name=self.credentials.get("AWS_DEFAULT_REGION")
            )
        elif provider == "Google Gemini" or provider == "OpenAI":
            return LLM(
                model=model,
                api_key=self.credentials.get("API_KEY")
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")

    @agent
    def tutor(self) -> Agent:
        return Agent(config=self.agents_config["tutor"], llm=self._get_llm(), verbose=False)  # type: ignore[index]

    @agent
    def quiz_master(self) -> Agent:
        return Agent(config=self.agents_config["quiz_master"], llm=self._get_llm(), verbose=False)  # type: ignore[index]

    @task
    def teach_task(self) -> Task:
        return Task(config=self.tasks_config["teach_task"])  # type: ignore[index]

    @task
    def quiz_task(self) -> Task:
        return Task(config=self.tasks_config["quiz_task"])  # type: ignore[index]

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=False,
        )


@CrewBase
class AssessmentCrew:
    """Evaluate quiz answers and generate a progress report."""

    agents_config = "config/agents.yaml"
    tasks_config = "config/assessment_tasks.yaml"

    agents: list[BaseAgent]
    tasks: list[Task]
    credentials: dict | None = None

    def __init__(self, credentials: dict):
        self.credentials = credentials

    def _get_llm(self) -> LLM:
        if not self.credentials:
            raise ValueError("Credentials not provided to AssessmentCrew")
        
        provider = self.credentials.get("PROVIDER", "")
        model = self.credentials.get("MODEL", "")
        
        if provider == "AWS Bedrock":
            return LLM(
                model=model,
                aws_access_key_id=self.credentials.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=self.credentials.get("AWS_SECRET_ACCESS_KEY"),
                aws_region_name=self.credentials.get("AWS_DEFAULT_REGION")
            )
        elif provider == "Google Gemini" or provider == "OpenAI":
            return LLM(
                model=model,
                api_key=self.credentials.get("API_KEY")
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")

    @agent
    def quiz_master(self) -> Agent:
        return Agent(config=self.agents_config["quiz_master"], llm=self._get_llm(), verbose=False)  # type: ignore[index]

    @agent
    def progress_analyst(self) -> Agent:
        return Agent(config=self.agents_config["progress_analyst"], llm=self._get_llm(), verbose=False)  # type: ignore[index]

    @task
    def evaluate_task(self) -> Task:
        return Task(config=self.tasks_config["evaluate_task"])  # type: ignore[index]

    @task
    def report_task(self) -> Task:
        return Task(config=self.tasks_config["report_task"])  # type: ignore[index]

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=False,
        )
