"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

interface ManualViewProps {
  onBack: () => void;
  onIntentReceived: (intent: any, reader: ReadableStreamDefaultReader<Uint8Array>, initialText?: string) => void;
}

export function ManualView({ onBack, onIntentReceived }: ManualViewProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    topics: "",
    notes: ""
  });

  const companies = ["Google", "Meta", "Amazon", "Apple", "Netflix", "Microsoft", "Stripe", "Uber", "Airbnb", "Other"];
  const roles = ["Frontend Engineer", "Backend Engineer", "Fullstack Engineer", "Mobile Engineer", "Data Engineer", "Systems Engineer", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const naturalLanguageRequest = `I need a problem for a ${formData.role} role at ${formData.company}. Topics: ${formData.topics}. Notes: ${formData.notes}`;
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: naturalLanguageRequest }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const intentEndIndex = buffer.indexOf("__INTENT_END__\n");
        if (intentEndIndex !== -1) {
          const intentStartIndex = buffer.indexOf("__INTENT__");
          if (intentStartIndex !== -1) {
            const intentStr = buffer.substring(intentStartIndex + "__INTENT__".length, intentEndIndex);
            const intent = JSON.parse(intentStr);
            
            const remainingText = buffer.substring(intentEndIndex + "__INTENT_END__\n".length);
            onIntentReceived(intent, reader, remainingText);
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4"
    >
      <div className="w-full max-w-2xl bg-card rounded-2xl p-8 border shadow-sm relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-4 top-4" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-3xl font-semibold mb-8 text-center text-card-foreground mt-4">
          Configure Your Problem
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Target Company</Label>
              <Select onValueChange={(val) => setFormData(p => ({ ...p, company: val as string }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role / Field</Label>
              <Select onValueChange={(val) => setFormData(p => ({ ...p, role: val as string }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specific Topics (Comma separated)</Label>
            <Input 
              placeholder="e.g. Dynamic Programming, Graphs, System Design" 
              value={formData.topics}
              onChange={e => setFormData(p => ({ ...p, topics: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Extra Notes</Label>
            <Textarea 
              placeholder="Any other specific requests..."
              className="resize-none h-24"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-6 text-lg rounded-xl"
            disabled={loading || !formData.company || !formData.role}
          >
            {loading ? "Generating..." : "Generate Problem"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
