import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <h1 className="text-5xl font-bold mb-6">AI Ad Briefing Tool</h1>
      <p className="text-xl max-w-2xl mb-10">
        A powerful web application for managing brand information, target audiences, 
        competitor insights, and creating AI-assisted advertising briefs.
      </p>
      
      <div className="flex gap-4">
        <Link href="/signup">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Login</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Brand Management</h2>
          <p>
            Organize and store all your brand information in one place, including voice, tone, 
            values, and visual guidelines.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Audience Targeting</h2>
          <p>
            Define and refine your target audiences with detailed demographic, 
            psychographic, and behavioral insights.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">AI-Assisted Briefs</h2>
          <p>
            Leverage AI to generate comprehensive advertising briefs that align 
            with your brand and effectively target your audience.
          </p>
        </div>
      </div>
    </div>
  );
}
