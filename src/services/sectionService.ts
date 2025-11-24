import { Section } from '../types/technicalMemory';

export class SectionService {
  private static instance: SectionService;

  static getInstance(): SectionService {
    if (!SectionService.instance) {
      SectionService.instance = new SectionService();
    }
    return SectionService.instance;
  }

  updateSection(
    sections: Section[], 
    sectionId: string, 
    updates: Partial<Section>
  ): Section[] {
    return sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    );
  }

  getSectionById(sections: Section[], sectionId: string): Section | undefined {
    return sections.find(s => s.id === sectionId);
  }

  getEmptySections(sections: Section[]): Section[] {
    return sections.filter(s => !s.content);
  }

  getCompletedSections(sections: Section[]): Section[] {
    return sections.filter(s => s.content);
  }

  markAllEmptySectionsAsGenerating(sections: Section[]): Section[] {
    return sections.map(section => 
      !section.content ? { ...section, isGenerating: true } : section
    );
  }
}