import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Upload, Download, Trash2, FileText, AlertCircle, Shield, Clock } from 'lucide-react';

interface SecureDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  expires_at: string | null;
  notes: string | null;
}

interface DocumentTypeInfo {
  key: string;
  label: string;
  description: string;
  hasExpiration: boolean;
}

const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  {
    key: 'kbis',
    label: 'Extrait Kbis',
    description: 'Extrait d\'immatriculation au registre du commerce',
    hasExpiration: true
  },
  {
    key: 'bilan_1',
    label: 'Dernier bilan',
    description: 'Bilan comptable de l\'exercice N-1',
    hasExpiration: false
  },
  {
    key: 'bilan_2',
    label: 'Avant-dernier bilan',
    description: 'Bilan comptable de l\'exercice N-2',
    hasExpiration: false
  },
  {
    key: 'bilan_3',
    label: 'Antépénultième bilan',
    description: 'Bilan comptable de l\'exercice N-3',
    hasExpiration: false
  },
  {
    key: 'attestation_sociale',
    label: 'Attestation de régularité sociale',
    description: 'URSSAF',
    hasExpiration: true
  },
  {
    key: 'attestation_fiscale',
    label: 'Attestation de régularité fiscale',
    description: 'Services fiscaux',
    hasExpiration: true
  },
  {
    key: 'cni_recto',
    label: 'CNI Dirigeant - Recto',
    description: 'Carte nationale d\'identité du dirigeant (recto)',
    hasExpiration: true
  },
  {
    key: 'cni_verso',
    label: 'CNI Dirigeant - Verso',
    description: 'Carte nationale d\'identité du dirigeant (verso)',
    hasExpiration: true
  },
  {
    key: 'rib',
    label: 'RIB',
    description: 'Relevé d\'identité bancaire',
    hasExpiration: false
  }
];

export function SecureVault() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('secure_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('document_type');

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType: string, file: File, expiresAt?: string) => {
    if (!user || !file) return;

    setUploading(documentType);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('secure-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('secure_documents')
        .upsert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          expires_at: expiresAt || null
        }, {
          onConflict: 'user_id,document_type'
        });

      if (dbError) throw dbError;

      await loadDocuments();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setUploading(null);
    }
  };

  const handleDownload = async (doc: SecureDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('secure-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handleDelete = async (doc: SecureDocument) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('secure-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('secure_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      await loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du document');
    }
  };

  const handleSaveNotes = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('secure_documents')
        .update({ notes })
        .eq('id', docId);

      if (error) throw error;

      await loadDocuments();
      setEditingNotes(null);
      setNotes('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
      alert('Erreur lors de la sauvegarde des notes');
    }
  };

  const getDocument = (type: string): SecureDocument | undefined => {
    return documents.find(doc => doc.document_type === type);
  };

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Coffre-Fort Numérique</h1>
        </div>
        <p className="text-gray-600">
          Stockez vos documents administratifs sensibles en toute sécurité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const doc = getDocument(docType.key);
          const expired = doc?.expires_at ? isExpired(doc.expires_at) : false;
          const expiringSoon = doc?.expires_at ? isExpiringSoon(doc.expires_at) : false;

          return (
            <Card key={docType.key} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-lg text-gray-900">
                      {docType.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{docType.description}</p>
                </div>
              </div>

              {doc ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                        {doc.file_name}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      Uploadé le {formatDate(doc.uploaded_at)}
                    </div>

                    {doc.expires_at && (
                      <div className={`flex items-center gap-2 text-xs ${
                        expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {expired ? 'Expiré le' : 'Expire le'} {formatDate(doc.expires_at)}
                        </span>
                      </div>
                    )}

                    {expired && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        <span>Ce document a expiré, veuillez le renouveler</span>
                      </div>
                    )}

                    {expiringSoon && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        <span>Ce document expire bientôt</span>
                      </div>
                    )}

                    {doc.notes && editingNotes !== doc.id && (
                      <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>Notes:</strong> {doc.notes}
                      </div>
                    )}

                    {editingNotes === doc.id && (
                      <div className="mt-2">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ajouter des notes..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveNotes(doc.id)}
                            variant="primary"
                            size="sm"
                          >
                            Enregistrer
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingNotes(null);
                              setNotes('');
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(doc)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>

                    {editingNotes !== doc.id && (
                      <Button
                        onClick={() => {
                          setEditingNotes(doc.id);
                          setNotes(doc.notes || '');
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDelete(doc)}
                      variant="secondary"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (docType.hasExpiration) {
                            const expiry = prompt('Date d\'expiration (YYYY-MM-DD) - optionnel:');
                            handleFileUpload(docType.key, file, expiry || undefined);
                          } else {
                            handleFileUpload(docType.key, file);
                          }
                        }
                      }}
                      disabled={uploading === docType.key}
                      className="hidden"
                      id={`upload-replace-${docType.key}`}
                    />
                    <label
                      htmlFor={`upload-replace-${docType.key}`}
                      className="block"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        disabled={uploading === docType.key}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading === docType.key ? 'Upload en cours...' : 'Remplacer'}
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (docType.hasExpiration) {
                          const expiry = prompt('Date d\'expiration (YYYY-MM-DD) - optionnel:');
                          handleFileUpload(docType.key, file, expiry || undefined);
                        } else {
                          handleFileUpload(docType.key, file);
                        }
                      }
                    }}
                    disabled={uploading === docType.key}
                    className="hidden"
                    id={`upload-${docType.key}`}
                  />
                  <label
                    htmlFor={`upload-${docType.key}`}
                    className="block"
                  >
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={uploading === docType.key}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading === docType.key ? 'Upload en cours...' : 'Uploader le document'}
                    </Button>
                  </label>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Formats acceptés: PDF, JPG, PNG (max 10 MB)
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Sécurité et confidentialité</h4>
            <p className="text-sm text-blue-800">
              Tous vos documents sont stockés de manière sécurisée et chiffrée.
              Seul vous avez accès à ces fichiers. Pensez à mettre à jour les documents
              avant leur date d'expiration pour faciliter vos réponses aux marchés publics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
