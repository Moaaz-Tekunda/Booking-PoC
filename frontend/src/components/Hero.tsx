import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Settings, User } from "lucide-react";

interface HeroProps {
  onStartNow?: () => void;
}

const Hero = ({ onStartNow }: HeroProps) => {
//
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-hero">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: `url('/HeroImage.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
        
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Book Your Perfect</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Stay
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover extraordinary accommodations worldwide. From luxury hotels to unique stays, 
              find your perfect escape with seamless booking.
            </p>
            
            {/* Quick Search Bar */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">Where are you going?</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">Add dates</p>
                  </div>
                </div>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={onStartNow}
                >
                  Start Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">50k+</div>
                <div className="text-sm text-muted-foreground">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;