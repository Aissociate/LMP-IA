export interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  defaultPrompt: string;
  content: string;
  isEditing: boolean;
  isGenerating: boolean;
  isEnabled?: boolean;
}