import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2, Building2, Users, Clock, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface ContactSalesPageProps {
  onBack: () => void;
}

export function ContactSalesPage({ onBack }: ContactSalesPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    jobTitle: "",
    country: "",
    message: "",
    interest: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to localStorage for demo
    const submissions = JSON.parse(localStorage.getItem('salesInquiries') || '[]');
    submissions.push({
      ...formData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'new'
    });
    localStorage.setItem('salesInquiries', JSON.stringify(submissions));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast.success('Message sent successfully!', {
      description: 'Our sales team will contact you within 24 hours'
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
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

        {/* Success Message */}
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="size-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="size-12 text-white" />
              </div>
            </div>
            <h1 className="text-white text-4xl mb-4">Thank You!</h1>
            <p className="text-slate-400 text-lg mb-8">
              We've received your inquiry and our sales team will get back to you within 24 hours.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
              <p className="text-slate-300 mb-4">
                A confirmation email has been sent to <span className="text-cyan-400">{formData.email}</span>
              </p>
              <p className="text-slate-400 text-sm">
                Reference ID: #{Date.now().toString().slice(-8)}
              </p>
            </div>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white"
            >
              Return to Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 mb-4">
                Contact Sales
              </Badge>
              <h1 className="text-white text-4xl md:text-5xl mb-4">
                Let's Build Something Amazing Together
              </h1>
              <p className="text-slate-400 text-lg">
                Ready to transform your business with AI voice agents? Our enterprise team is here to help you get started.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white mb-1">Email Us</h3>
                      <p className="text-slate-400 text-sm mb-2">For general inquiries</p>
                      <a href="mailto:sales@voiceai.com" className="text-cyan-400 hover:text-cyan-300">
                        sales@voiceai.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0">
                      <Phone className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white mb-1">Call Us</h3>
                      <p className="text-slate-400 text-sm mb-2">Mon-Fri, 9am-6pm EST</p>
                      <a href="tel:+18885551234" className="text-emerald-400 hover:text-emerald-300">
                        +1 (888) 555-1234
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shrink-0">
                      <MapPin className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white mb-1">Visit Us</h3>
                      <p className="text-slate-400 text-sm">
                        123 AI Innovation Way<br />
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Enterprise Clients", value: "500+" },
                { icon: Clock, label: "Avg Response Time", value: "2 hours" },
                { icon: Globe, label: "Countries Served", value: "45+" },
                { icon: Building2, label: "Industries", value: "20+" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-4"
                >
                  <stat.icon className="size-8 text-cyan-400 mb-2" />
                  <div className="text-2xl text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Get in Touch</CardTitle>
                <p className="text-slate-400">Fill out the form and our team will contact you shortly</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-300">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-2"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-slate-300">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-2"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-300">Work Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-2"
                      placeholder="john.smith@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-2"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company" className="text-slate-300">Company Name *</Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-2"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle" className="text-slate-300">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-2"
                        placeholder="CEO, CTO, etc."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companySize" className="text-slate-300">Company Size *</Label>
                      <Select
                        required
                        value={formData.companySize}
                        onValueChange={(value) => handleChange('companySize', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-slate-300">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-2"
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interest" className="text-slate-300">What are you interested in? *</Label>
                    <Select
                      required
                      value={formData.interest}
                      onValueChange={(value) => handleChange('interest', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="inbound">Inbound Voice Agents</SelectItem>
                        <SelectItem value="outbound">Outbound Call Campaigns</SelectItem>
                        <SelectItem value="enterprise">Enterprise Solutions</SelectItem>
                        <SelectItem value="whitelabel">White-Label Partnership</SelectItem>
                        <SelectItem value="api">API Integration</SelectItem>
                        <SelectItem value="custom">Custom Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-slate-300">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-2 min-h-32"
                      placeholder="Tell us about your project and requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white h-12"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="size-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-slate-500 text-xs text-center">
                    By submitting this form, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
