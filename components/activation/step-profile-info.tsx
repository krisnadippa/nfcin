"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { TEMPLATE_MAP } from "@/constants/templates";
import type { ProfileTemplate } from "@/types";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  profession: string;
  company_name: string;
  industry: string;
  location: string;
  website_url: string;
}

interface StepProfileInfoProps {
  template: ProfileTemplate;
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepProfileInfo({
  template,
  data,
  onChange,
  onBack,
  onNext,
}: StepProfileInfoProps) {
  const config = TEMPLATE_MAP[template];
  const fields = config?.fields ?? ["name", "username", "bio"];

  const isCompany = template === "company";

  function update(key: keyof ProfileData, value: string) {
    onChange({ ...data, [key]: value });
  }

  function handleNext() {
    if (!data.name && !data.company_name) return;
    if (!data.username) return;
    onNext();
  }

  return (
    <div>
      <h2 className="text-subheading mb-1">Your Information</h2>
      <p className="text-caption mb-6">
        Fill in your profile details for the {config?.label} template.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {fields.includes("company_name") && (
          <Input
            label="Company Name"
            value={data.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            placeholder="Your Company"
            required
          />
        )}
        {fields.includes("name") && (
          <Input
            label={isCompany ? "Contact Name" : "Full Name"}
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            required
          />
        )}
        {fields.includes("username") && (
          <Input
            label="Username"
            value={data.username}
            onChange={(e) =>
              update("username", e.target.value.toLowerCase().replace(/\s+/g, ""))
            }
            placeholder="yourname"
            helper="This will be your public profile URL: /p/yourname"
            required
          />
        )}
        {fields.includes("profession") && (
          <Input
            label="Profession / Title"
            value={data.profession}
            onChange={(e) => update("profession", e.target.value)}
            placeholder="Photographer, Developer, Designer..."
          />
        )}
        {fields.includes("bio") && (
          <Textarea
            label="Bio"
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="A short description about yourself..."
            rows={3}
          />
        )}
        {fields.includes("industry") && (
          <Input
            label="Industry"
            value={data.industry}
            onChange={(e) => update("industry", e.target.value)}
            placeholder="Technology, Fashion, Food..."
          />
        )}
        {fields.includes("location") && (
          <Input
            label="Location"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Jakarta, Indonesia"
          />
        )}
        {fields.includes("website_url") && (
          <Input
            label="Website"
            type="url"
            value={data.website_url}
            onChange={(e) => update("website_url", e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Continue</Button>
      </div>
    </div>
  );
}
