import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const PROJECTS = [
  {
    id: 'cloudtrace',
    name: 'CloudTrace',
    team: 'Team Nebula',
    status: 'Shipped',
    statusVariant: 'green',
    stack: ['AWS Lambda', 'DynamoDB', 'React'],
    description: 'Distributed tracing dashboard for serverless workloads, built entirely on AWS.',
    repo: '#',
    demo: '#',
  },
  {
    id: 'iot-monitor',
    name: 'Campus IoT Monitor',
    team: 'Team Circuit',
    status: 'Active',
    statusVariant: 'orange',
    stack: ['AWS IoT Core', 'Grafana', 'Python', 'MQTT'],
    description: 'Real-time energy consumption monitoring across the RIT campus using IoT sensors.',
    repo: '#',
    demo: '#',
  },
  {
    id: 'placement-ml',
    name: 'PlacePred ML',
    team: 'Team Synapse',
    status: 'In Progress',
    statusVariant: 'blue',
    stack: ['SageMaker', 'S3', 'Python', 'scikit-learn'],
    description: 'ML model predicting placement outcomes using anonymized historical RIT data.',
    repo: '#',
    demo: null,
  },
  {
    id: 'sbg-portal',
    name: 'SBG Portal (This Site)',
    team: 'Core Team',
    status: 'Active',
    statusVariant: 'orange',
    stack: ['React', 'Vite', 'Django', 'DRF'],
    description: 'The official platform you\'re on now. Open-source, contributions welcome.',
    repo: 'https://github.com',
    demo: '#',
  },
];

const StatusDot = ({ variant }) => {
  const colors = {
    green: 'bg-emerald-400',
    orange: 'bg-aws-orange',
    blue: 'bg-blue-400',
    purple: 'bg-sbg-purple-glow',
  };
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors[variant] ?? colors.blue}`} />;
};

const Build = () => (
  <div className="page-inner">
    <SectionHeader
      title="Build"
      subtitle="Projects built by AWS SBG RIT members — real-world cloud applications on AWS infrastructure."
    >
      <Badge variant="orange">{PROJECTS.length} Projects</Badge>
      <Button variant="outline" size="sm" id="build-submit-project-btn">
        Submit a Project
      </Button>
    </SectionHeader>

    <div className="grid sm:grid-cols-2 gap-4">
      {PROJECTS.map((project, i) => (
        <Card
          key={project.id}
          className="flex flex-col gap-3 animate-in"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-text-primary">{project.name}</h3>
              <p className="text-xs text-text-subtle mt-0.5">by {project.team}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot variant={project.statusVariant} />
              <Badge variant={project.statusVariant}>{project.status}</Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-text-muted leading-relaxed">{project.description}</p>

          {/* Stack */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="gray">{tech}</Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 pt-3 mt-auto border-t border-border-card">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer"
                className="btn-ghost btn text-xs px-2 py-1" id={`${project.id}-repo-btn`}>
                GitHub →
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer"
                className="btn-outline btn text-xs px-2 py-1" id={`${project.id}-demo-btn`}>
                Live Demo
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default Build;
