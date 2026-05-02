import React from "react";
import { ScreenHeader, PageContainer, Section } from "../ui/Shell";
import { Shield, Globe, Github, Mail, MessageSquare } from "lucide-react";

export function About() {
  return (
    <>
      <ScreenHeader title="About" subtitle="RootRecord Account Hub" />
      <PageContainer>
        <Section>
          <div className="p-5">
            <p className="font-heading text-lg text-ink-primary">
              RootRecord Account Hub
            </p>
            <p className="text-xs text-ink-tertiary mt-1">Version 0.1.0 · Android · Capacitor 6</p>
            <p className="text-sm text-ink-secondary mt-4">
              The Account Hub is your home for every RootRecord app — one
              sign-in, one subscription, one place to manage security and
              preferences. It shares the primary API at{" "}
              <span className="font-mono">api.rootrecord.info</span> with
              Weather Manager and Business Manager.
            </p>
          </div>
        </Section>
        <Section title="Links">
          <LinkRow
            icon={Globe}
            label="rootrecord.info"
            href="https://rootrecord.info"
            testid="about-link-web"
          />
          <LinkRow
            icon={Shield}
            label="Privacy &amp; security"
            href="https://rootrecord.info/privacy"
            testid="about-link-privacy"
          />
          <LinkRow
            icon={Github}
            label="Public releases"
            href="https://github.com/RootRecord"
            testid="about-link-github"
          />
        </Section>
      </PageContainer>
    </>
  );
}

export function Help() {
  return (
    <>
      <ScreenHeader title="Help &amp; feedback" subtitle="We read every message" />
      <PageContainer>
        <Section title="Contact">
          <LinkRow
            icon={Mail}
            label="support@rootrecord.info"
            href="mailto:support@rootrecord.info"
            testid="help-link-email"
          />
          <LinkRow
            icon={MessageSquare}
            label="Send feedback"
            href="https://rootrecord.info/feedback"
            testid="help-link-feedback"
          />
        </Section>
        <p className="text-xs text-ink-tertiary px-2">
          Describe what you were doing and include your device model when
          possible. Screenshots help a lot.
        </p>
      </PageContainer>
    </>
  );
}

function LinkRow({ icon: Icon, label, href, testid }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testid}
      className="row hover:bg-bg-elevated"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-brand-light" />
        <span
          className="text-sm font-semibold text-ink-primary"
          dangerouslySetInnerHTML={{ __html: label }}
        />
      </div>
    </a>
  );
}
