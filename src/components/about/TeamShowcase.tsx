import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Github, Mail } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills: string[];
  social: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
  achievements?: string[];
}

interface TeamShowcaseProps {
  title?: string;
  subtitle?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    role: 'Founder & CEO',
    bio: 'Visionary leader with 15+ years in technology innovation. Passionate about building solutions that transform businesses.',
    avatar: '/api/placeholder/150/150',
    skills: ['Strategic Planning', 'Product Vision', 'Team Leadership', 'Business Development'],
    social: {
      linkedin: '#',
      email: 'alex@devmart.sr'
    },
    achievements: [
      'Founded 3 successful tech companies',
      'Named Tech Entrepreneur of the Year 2023',
      'Keynote speaker at 20+ international conferences'
    ]
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'CTO & Lead Developer',
    bio: 'Full-stack architect with expertise in modern web technologies and scalable system design.',
    avatar: '/api/placeholder/150/150',
    skills: ['React', 'Node.js', 'AWS', 'System Architecture', 'DevOps'],
    social: {
      linkedin: '#',
      github: '#',
      email: 'sarah@devmart.sr'
    },
    achievements: [
      'Built 50+ production applications',
      'AWS Solutions Architect Certified',
      'Open source contributor with 10k+ GitHub stars'
    ]
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    role: 'Head of Design',
    bio: 'Creative director focused on user-centered design and brand storytelling that resonates globally.',
    avatar: '/api/placeholder/150/150',
    skills: ['UI/UX Design', 'Brand Strategy', 'Design Systems', 'User Research'],
    social: {
      linkedin: '#',
      email: 'marcus@devmart.sr'
    },
    achievements: [
      'Awwwards Designer of the Year 2022',
      'Led design for 100+ digital products',
      'Mentor at Design Academy Caribbean'
    ]
  },
  {
    id: '4',
    name: 'Priya Patel',
    role: 'Head of Operations',
    bio: 'Operations expert ensuring seamless project delivery and exceptional client experiences worldwide.',
    avatar: '/api/placeholder/150/150',
    skills: ['Project Management', 'Process Optimization', 'Client Relations', 'Quality Assurance'],
    social: {
      linkedin: '#',
      email: 'priya@devmart.sr'
    },
    achievements: [
      'PMP & Agile Certified',
      'Achieved 98% client satisfaction rate',
      'Scaled operations across 15 countries'
    ]
  }
];

export function TeamShowcase({ title = "Meet Our Team", subtitle = "The passionate individuals driving innovation at Devmart" }: TeamShowcaseProps) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
            Our Team
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
            {title}
          </h2>
          <p className="text-agenko-gray-light max-w-3xl mx-auto text-lg">
            {subtitle}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group hover:border-agenko-green/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-agenko-green/20 rounded-xl flex items-center justify-center">
                      <span className="text-agenko-green text-3xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-agenko-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-agenko-green font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-agenko-gray-light text-sm mb-4 leading-relaxed">
                      {member.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          className="w-8 h-8 bg-agenko-dark rounded-lg flex items-center justify-center text-agenko-gray-light hover:text-agenko-green hover:bg-agenko-green/10 transition-colors"
                          aria-label={`${member.name} LinkedIn`}
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.github && (
                        <a
                          href={member.social.github}
                          className="w-8 h-8 bg-agenko-dark rounded-lg flex items-center justify-center text-agenko-gray-light hover:text-agenko-green hover:bg-agenko-green/10 transition-colors"
                          aria-label={`${member.name} GitHub`}
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.email && (
                        <a
                          href={`mailto:${member.social.email}`}
                          className="w-8 h-8 bg-agenko-dark rounded-lg flex items-center justify-center text-agenko-gray-light hover:text-agenko-green hover:bg-agenko-green/10 transition-colors"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                {member.achievements && (
                  <div className="mt-6 pt-6 border-t border-agenko-gray/20">
                    <h4 className="text-sm font-medium text-agenko-white mb-3">Key Achievements</h4>
                    <ul className="space-y-1">
                      {member.achievements.map((achievement, index) => (
                        <li key={index} className="text-xs text-agenko-gray-light flex items-start">
                          <span className="text-agenko-green mr-2">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Innovation First',
              description: 'We constantly push boundaries and explore emerging technologies to deliver cutting-edge solutions.',
              icon: '🚀'
            },
            {
              title: 'Client Partnership',
              description: 'We build lasting relationships by understanding your business and becoming an extension of your team.',
              icon: '🤝'
            },
            {
              title: 'Excellence Driven',
              description: 'We maintain the highest standards in everything we do, from code quality to client communication.',
              icon: '⭐'
            }
          ].map((value, index) => (
            <Card key={index} className="bg-agenko-dark-lighter border-agenko-gray/20 text-center group hover:border-agenko-green/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">{value.title}</h3>
                <p className="text-agenko-gray-light text-sm leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}