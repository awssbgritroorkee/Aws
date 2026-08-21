import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const PATHS = [
  {
    id: 'cloud-practitioner',
    title: 'AWS Cloud Practitioner',
    level: 'Foundational',
    levelVariant: 'green',
    duration: '6–10 hrs',
    description: 'Core cloud concepts, AWS services overview, pricing, and security fundamentals.',
    modules: ['Cloud Concepts', 'AWS Core Services', 'Security & Compliance', 'Billing & Pricing'],
    link: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
  },
  {
    id: 'solutions-architect',
    title: 'Solutions Architect – Associate',
    level: 'Associate',
    levelVariant: 'blue',
    duration: '40+ hrs',
    description: 'Design resilient, high-performing, secure, and cost-optimized architectures on AWS.',
    modules: ['EC2 & VPC', 'S3 & Glacier', 'RDS & Aurora', 'IAM & Security'],
    link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
  },
  {
    id: 'developer',
    title: 'AWS Developer – Associate',
    level: 'Associate',
    levelVariant: 'blue',
    duration: '35+ hrs',
    description: 'Build, deploy, and debug cloud-native applications using AWS services and CLI tools.',
    modules: ['Lambda & API Gateway', 'DynamoDB', 'CloudFormation', 'CI/CD Pipelines'],
    link: 'https://aws.amazon.com/certification/certified-developer-associate/',
  },
  {
    id: 'ml-specialty',
    title: 'AWS Machine Learning – Specialty',
    level: 'Specialty',
    levelVariant: 'orange',
    duration: '50+ hrs',
    description: 'Design, implement, deploy, and maintain ML solutions using AWS SageMaker and related services.',
    modules: ['SageMaker', 'Data Engineering', 'Model Training', 'MLOps on AWS'],
    link: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/',
  },
];

const RESOURCES = [
  { label: 'AWS Skill Builder', url: 'https://skillbuilder.aws', badge: 'Free' },
  { label: 'AWS Documentation', url: 'https://docs.aws.amazon.com', badge: 'Official' },
  { label: 'AWS Workshops',     url: 'https://workshops.aws',     badge: 'Hands-on' },
  { label: 'AWS re:Post',       url: 'https://repost.aws',        badge: 'Community' },
];

const Learn = () => (
  <div className="page-inner">
    <SectionHeader
      title="Learn"
      subtitle="Structured AWS certification paths and curated learning resources for SBG RIT members."
    >
      <Badge variant="orange">AWS Training</Badge>
    </SectionHeader>

    {/* Certification paths */}
    <section aria-label="Certification paths" className="mb-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-4">
        Certification Paths
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {PATHS.map((path, i) => (
          <Card
            key={path.id}
            className="flex flex-col gap-3 animate-in"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-text-primary leading-snug">{path.title}</h3>
              <Badge variant={path.levelVariant}>{path.level}</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{path.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {path.modules.map((m) => (
                <Badge key={m} variant="gray">{m}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-card">
              <span className="text-xs text-text-subtle">{path.duration}</span>
              <a href={path.link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" id={`learn-${path.id}-btn`}>
                  Start Path →
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </section>

    {/* Resources */}
    <section aria-label="Quick resources">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-4">
        Quick Resources
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {RESOURCES.map((r) => (
          <a
            key={r.label}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between group hover:border-border-subtle transition-all"
            id={`resource-${r.label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">
              {r.label}
            </span>
            <Badge variant="orange">{r.badge}</Badge>
          </a>
        ))}
      </div>
    </section>
  </div>
);

export default Learn;
