import { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    const screenshotData = await captureScreenshot();
    setScreenshot(screenshotData);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
    setDescription('');
    setScreenshot(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: 'error', text: 'Vous devez être connecté pour signaler un bug' });
        return;
      }

      let screenshotUrl = null;

      if (screenshot) {
        const blob = await (await fetch(screenshot)).blob();
        const filename = `bug-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-assets')
          .upload(`screenshots/${user.id}/${filename}`, blob, {
            contentType: 'image/png',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading screenshot:', uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('report-assets')
            .getPublicUrl(uploadData.path);
          screenshotUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('bug_reports').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        status: 'reported',
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Bug signalé avec succès!' });
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi du rapport' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        title="Signaler un bug"
      >
        <Bug className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bug className="w-6 h-6 text-red-500" />
                Signaler un bug
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du bug
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Erreur lors de la sauvegarde"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Décrivez le problème rencontré, les étapes pour le reproduire..."
                  disabled={isSubmitting}
                />
              </div>

              {screenshot && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capture d'écran
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={screenshot}
                      alt="Screenshot"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
