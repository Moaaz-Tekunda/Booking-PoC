import { Search, Calendar, MapPin } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse thousands of verified properties worldwide with detailed photos and reviews.",
    step: "01",
  },
  {
    icon: Calendar,
    title: "Select & Compare",
    description: "Choose your dates, compare prices, and find the perfect accommodation for your needs.",
    step: "02",
  },
  {
    icon: MapPin,
    title: "Book & Enjoy",
    description: "Complete your secure booking in minutes and get ready for an amazing stay.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book your perfect stay in three simple steps.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group h-full">
              {/* Connection Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-x-1/2 z-0" />
              )}
              
              {/* Card */}
              <div className="relative z-10 h-full bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center group-hover:bg-card/70 group-hover:shadow-card group-hover:scale-[1.02] transition-all duration-200 flex flex-col">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-6 mx-auto">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;