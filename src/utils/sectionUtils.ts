import { Section } from '../types/technicalMemory';

export function getEnabledSectionsWithContent(sections: Section[]): Section[] {
  return sections.filter(
    section => section.isEnabled !== false && section.content && section.content.trim()
  );
}

export function sortSectionsByOrder(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getEnabledAndSortedSections(sections: Section[]): Section[] {
  return sortSectionsByOrder(getEnabledSectionsWithContent(sections));
}

export function getSectionById(sections: Section[], id: string): Section | undefined {
  return sections.find(section => section.id === id);
}

export function updateSectionContent(sections: Section[], id: string, content: string): Section[] {
  return sections.map(section =>
    section.id === id ? { ...section, content } : section
  );
}

export function toggleSectionEnabled(sections: Section[], id: string): Section[] {
  return sections.map(section =>
    section.id === id ? { ...section, isEnabled: !section.isEnabled } : section
  );
}
