import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Heart, Users, Zap, Globe, TrendingUp, Send, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface CareersPageProps {
  onBack: () => void;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

const jobListings: Job[] = [
  {
    id: "1",
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    salary: "$150k - $200k",
    description: "Join our AI team to build cutting-edge voice agents using the latest LLM technology. You'll work on real-time voice processing, natural language understanding, and conversational AI systems.",
    requirements: [
      "5+ years of experience in AI/ML engineering",
      "Strong proficiency in Python and TensorFlow/PyTorch",
      "Experience with LLMs and voice AI technologies",
      "Knowledge of NLP and speech recognition systems",
      "Bachelor's degree in Computer Science or related field"
    ],
    responsibilities: [
      "Design and implement AI voice agent architectures",
      "Optimize model performance and response times",
      "Collaborate with product team on new features",
      "Mentor junior engineers and conduct code reviews",
      "Research and integrate latest AI technologies"
    ],
    benefits: [
      "Competitive salary and equity package",
      "Health, dental, and vision insurance",
      "Unlimited PTO",
      "Remote work flexibility",
      "Learning and development budget"
    ]
  },
  {
    id: "2",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $160k",
    description: "We're looking for a talented product designer to create intuitive and beautiful experiences for our AI voice platform. You'll own the design process from concept to implementation.",
    requirements: [
      "4+ years of product design experience",
      "Strong portfolio showcasing UX/UI work",
      "Proficiency in Figma and design systems",
      "Experience with B2B SaaS products",
      "Understanding of conversational interfaces"
    ],
    responsibilities: [
      "Design user-friendly interfaces for our platform",
      "Create and maintain design system",
      "Conduct user research and usability testing",
      "Collaborate with engineers on implementation",
      "Define product vision and strategy"
    ],
    benefits: [
      "Competitive salary and equity",
      "Latest design tools and equipment",
      "Flexible work arrangements",
      "Conference and workshop attendance",
      "Health and wellness benefits"
    ]
  },
  {
    id: "3",
    title: "Enterprise Sales Executive",
    department: "Sales",
    location: "New York, NY / Remote",
    type: "Full-time",
    salary: "$100k - $150k + Commission",
    description: "Drive enterprise sales for our AI voice platform. You'll work with Fortune 500 companies to implement voice AI solutions at scale.",
    requirements: [
      "5+ years of B2B SaaS sales experience",
      "Proven track record of closing enterprise deals",
      "Experience selling to C-level executives",
      "Strong understanding of AI/ML technologies",
      "Excellent communication and presentation skills"
    ],
    responsibilities: [
      "Generate and close enterprise opportunities",
      "Build relationships with key decision makers",
      "Conduct product demonstrations and POCs",
      "Collaborate with solution engineers",
      "Meet and exceed sales quotas"
    ],
    benefits: [
      "Uncapped commission structure",
      "Stock options",
      "Travel opportunities",
      "Sales enablement and training",
      "Comprehensive benefits package"
    ]
  },
  {
    id: "4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$130k - $170k",
    description: "Build and maintain the infrastructure that powers millions of AI voice conversations. You'll work on scaling, reliability, and performance optimization.",
    requirements: [
      "3+ years of DevOps/SRE experience",
      "Strong knowledge of AWS/GCP/Azure",
      "Experience with Kubernetes and Docker",
      "Proficiency in Infrastructure as Code (Terraform)",
      "Understanding of CI/CD pipelines"
    ],
    responsibilities: [
      "Manage cloud infrastructure and deployments",
      "Implement monitoring and alerting systems",
      "Optimize system performance and costs",
      "Ensure high availability and disaster recovery",
      "Automate operational processes"
    ],
    benefits: [
      "Competitive compensation",
      "Remote-first culture",
      "Learning budget for certifications",
      "Latest tools and technologies",
      "Health and retirement benefits"
    ]
  },
  {
    id: "5",
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    salary: "$80k - $110k",
    description: "Help our customers succeed with AI voice agents. You'll be the trusted advisor guiding clients through onboarding, implementation, and optimization.",
    requirements: [
      "3+ years in customer success or account management",
      "Experience with B2B SaaS products",
      "Strong technical aptitude",
      "Excellent communication skills",
      "Data-driven mindset"
    ],
    responsibilities: [
      "Onboard and train new customers",
      "Drive product adoption and engagement",
      "Identify expansion opportunities",
      "Gather customer feedback for product team",
      "Ensure customer retention and satisfaction"
    ],
    benefits: [
      "Competitive salary and bonuses",
      "Career growth opportunities",
      "Flexible schedule",
      "Comprehensive benefits",
      "Team building events"
    ]
  },
  {
    id: "6",
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $120k",
    description: "Create compelling content that educates and engages our audience about AI voice technology. You'll own our content strategy across all channels.",
    requirements: [
      "4+ years of content marketing experience",
      "Strong writing and storytelling skills",
      "Experience with SEO and content analytics",
      "Understanding of B2B SaaS marketing",
      "Knowledge of AI/technology topics"
    ],
    responsibilities: [
      "Develop and execute content strategy",
      "Create blog posts, whitepapers, and case studies",
      "Manage social media content calendar",
      "Optimize content for SEO and conversions",
      "Collaborate with sales on enablement materials"
    ],
    benefits: [
      "Competitive compensation package",
      "Creative freedom and autonomy",
      "Professional development budget",
      "Remote work flexibility",
      "Health and wellness benefits"
    ]
  }
];

export function CareersPage({ onBack }: CareersPageProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    coverLetter: "",
    resume: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to localStorage
    const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    applications.push({
      ...applicationData,
      jobId: selectedJob?.id,
      jobTitle: selectedJob?.title,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('jobApplications', JSON.stringify(applications));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast.success('Application submitted successfully!', {
      description: 'We\'ll review your application and get back to you soon'
    });

    setTimeout(() => {
      setShowApplicationForm(false);
      setIsSubmitted(false);
      setApplicationData({
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
        coverLetter: "",
        resume: null
      });
    }, 3000);
  };

  const departments = ["All", ...Array.from(new Set(jobListings.map(job => job.department)))];
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredJobs = selectedDepartment === "All" 
    ? jobListings 
    : jobListings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 mb-4">
            We're Hiring!
          </Badge>
          <h1 className="text-white text-4xl md:text-6xl mb-6">
            Join the Future of <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Voice AI</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl">
            Help us build the next generation of AI voice agents. Join a team of passionate innovators transforming how businesses communicate.
          </p>
        </motion.div>

        {/* Company Values */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Heart,
              title: "Mission Driven",
              description: "We're on a mission to make AI accessible to everyone",
              gradient: "from-red-500 to-pink-600"
            },
            {
              icon: Users,
              title: "Collaborative",
              description: "Work with talented people who inspire you daily",
              gradient: "from-cyan-500 to-blue-600"
            },
            {
              icon: Zap,
              title: "Fast-Paced",
              description: "Move fast, ship features, and iterate quickly",
              gradient: "from-orange-500 to-red-600"
            },
            {
              icon: TrendingUp,
              title: "Growth Focused",
              description: "Continuous learning and career development",
              gradient: "from-emerald-500 to-green-600"
            }
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900 border-slate-800 h-full hover:border-slate-700 transition-colors">
                <CardContent className="p-6">
                  <div className={`size-12 rounded-lg bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}>
                    <value.icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {departments.map(dept => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              onClick={() => setSelectedDepartment(dept)}
              className={selectedDepartment === dept 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              }
            >
              {dept}
            </Button>
          ))}
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {job.type}
                        </Badge>
                      </div>
                      <h3 className="text-white text-xl mb-2 group-hover:text-cyan-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-slate-400 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                      }}
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white whitespace-nowrap"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <h2 className="text-white text-3xl text-center mb-8">Why Join VoiceAI?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Remote First",
                description: "Work from anywhere in the world with flexible hours"
              },
              {
                icon: Heart,
                title: "Health & Wellness",
                description: "Comprehensive health, dental, and vision insurance"
              },
              {
                icon: TrendingUp,
                title: "Equity & Growth",
                description: "Competitive equity package and career development"
              },
              {
                icon: Clock,
                title: "Unlimited PTO",
                description: "Take time off when you need it, no questions asked"
              },
              {
                icon: Briefcase,
                title: "Learning Budget",
                description: "$2,000 annual budget for courses and conferences"
              },
              {
                icon: Users,
                title: "Amazing Team",
                description: "Work with world-class engineers and designers"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900 border-slate-800 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="size-6 text-white" />
                    </div>
                    <h3 className="text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob && !showApplicationForm} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedJob?.department} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-3 mt-4 mb-4">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              {selectedJob?.department}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="size-4" />
              {selectedJob?.location}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <DollarSign className="size-4" />
              {selectedJob?.salary}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <Clock className="size-4" />
              {selectedJob?.type}
            </span>
          </div>

          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-white mb-3">About the Role</h3>
              <p className="text-slate-400">{selectedJob?.description}</p>
            </div>

            <div>
              <h3 className="text-white mb-3">Requirements</h3>
              <ul className="space-y-2">
                {selectedJob?.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-400">
                    <CheckCircle2 className="size-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {selectedJob?.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-400">
                    <CheckCircle2 className="size-5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-3">Benefits</h3>
              <ul className="space-y-2">
                {selectedJob?.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-400">
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => setShowApplicationForm(true)}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white h-12"
            >
              Apply for this Position
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={() => setShowApplicationForm(false)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isSubmitted ? "Application Submitted!" : `Apply for ${selectedJob?.title}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isSubmitted 
                ? "Thank you for your interest! We'll review your application and get back to you soon."
                : "Fill out the form below to apply for this position"
              }
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-8 text-center">
              <div className="size-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <p className="text-slate-400">
                Your application has been submitted successfully. We'll be in touch!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={applicationData.name}
                  onChange={(e) => setApplicationData({...applicationData, name: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-2"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="app-email" className="text-slate-300">Email *</Label>
                  <Input
                    id="app-email"
                    type="email"
                    required
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="app-phone" className="text-slate-300">Phone</Label>
                  <Input
                    id="app-phone"
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin" className="text-slate-300">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={applicationData.linkedin}
                    onChange={(e) => setApplicationData({...applicationData, linkedin: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio" className="text-slate-300">Portfolio/Website</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={applicationData.portfolio}
                    onChange={(e) => setApplicationData({...applicationData, portfolio: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resume" className="text-slate-300">Resume/CV *</Label>
                <Input
                  id="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationData({...applicationData, resume: e.target.files?.[0] || null})}
                  className="bg-slate-800 border-slate-700 text-white mt-2"
                />
                <p className="text-slate-500 text-xs mt-1">PDF, DOC, or DOCX format</p>
              </div>

              <div>
                <Label htmlFor="coverLetter" className="text-slate-300">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  required
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-2 min-h-32"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white h-12"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="size-5 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}