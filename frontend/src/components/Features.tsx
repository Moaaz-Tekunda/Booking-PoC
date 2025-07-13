import { Shield, Clock, Star, Smartphone } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Your payments and personal information are protected with bank-level security.",
  },
  {
    icon: Clock,
    title: "Instant Confirmation",
    description: "Get immediate booking confirmation and access to your reservation details.",
  },
  {
    icon: Star,
    title: "Verified Properties",
    description: "All properties are verified and reviewed by our quality assurance team.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Book on-the-go with our responsive design that works on any device.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose <span className="text-primary">BookingApp</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience seamless booking with features designed for modern travelers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:shadow-card hover:border-primary/20 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;