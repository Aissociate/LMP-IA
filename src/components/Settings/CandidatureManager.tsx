import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Users, Mail, Phone, Calendar, CheckCircle, XCircle, Clock, Eye, EyeOff, FileText, MessageSquare, Briefcase, Target, DollarSign, ThumbsUp } from 'lucide-react';

interface Candidature {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  experiences_similaires: string;
  methode_eviter_erreurs: string;
  disponibilite_quotidienne: string;
  accord_paiement_tarif: boolean;
  motivations: string | null;
  statut: 'nouveau' | 'en_cours' | 'accepte' | 'refuse';
  notes_admin: string | null;
  created_at: string;
  updated_at: string;
}

export const CandidatureManager: React.FC = () => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [notesAdmin, setNotesAdmin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking admin status:', profileError);
        setError('Erreur lors de la vérification des permissions');
        setLoading(false);
        return;
      }

      if (!profile?.is_admin) {
        setError('Accès réservé aux administrateurs');
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      loadCandidatures();
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de la vérification des permissions');
      setLoading(false);
    }
  };

  const loadCandidatures = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('candidatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setCandidatures(data || []);

      if (data && data.length === 0) {
        setError('Aucune candidature pour le moment');
      }
    } catch (error: any) {
      console.error('Error loading candidatures:', error);
      setError(`Erreur lors du chargement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: string, newStatut: Candidature['statut']) => {
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ statut: newStatut })
        .eq('id', id);

      if (error) throw error;

      await loadCandidatures();
      if (selectedCandidature?.id === id) {
        setSelectedCandidature({ ...selectedCandidature, statut: newStatut });
      }
    } catch (error) {
      console.error('Error updating statut:', error);
    }
  };

  const updateNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ notes_admin: notesAdmin })
        .eq('id', id);

      if (error) throw error;

      await loadCandidatures();
      if (selectedCandidature?.id === id) {
        setSelectedCandidature({ ...selectedCandidature, notes_admin: notesAdmin });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      nouveau: 'bg-blue-100 text-blue-700',
      en_cours: 'bg-yellow-100 text-yellow-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-700',
    };

    const labels = {
      nouveau: 'Nouveau',
      en_cours: 'En cours',
      accepte: 'Accepté',
      refuse: 'Refusé',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[statut as keyof typeof styles]}`}>
        {labels[statut as keyof typeof labels]}
      </span>
    );
  };

  const filteredCandidatures = filterStatut === 'all'
    ? candidatures
    : candidatures.filter(c => c.statut === filterStatut);

  const stats = {
    total: candidatures.length,
    nouveau: candidatures.filter(c => c.statut === 'nouveau').length,
    en_cours: candidatures.filter(c => c.statut === 'en_cours').length,
    accepte: candidatures.filter(c => c.statut === 'accepte').length,
    refuse: candidatures.filter(c => c.statut === 'refuse').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[#F77F00]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidatures Recrutement</h2>
            <p className="text-sm text-gray-600">Gestion des candidatures assistant administratif</p>
          </div>
        </div>
        <Card className="p-8 bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-4">
            <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Accès refusé</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Seuls les administrateurs peuvent accéder à la gestion des candidatures.
                Si vous pensez que c'est une erreur, contactez un administrateur système.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[#F77F00]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidatures Recrutement</h2>
            <p className="text-sm text-gray-600">Gestion des candidatures assistant administratif</p>
          </div>
        </div>
      </div>

      {error && candidatures.length === 0 && (
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <p className="text-yellow-800 font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card className="p-4 text-center bg-blue-50">
          <div className="text-2xl font-bold text-blue-700">{stats.nouveau}</div>
          <div className="text-sm text-blue-600">Nouveau</div>
        </Card>
        <Card className="p-4 text-center bg-yellow-50">
          <div className="text-2xl font-bold text-yellow-700">{stats.en_cours}</div>
          <div className="text-sm text-yellow-600">En cours</div>
        </Card>
        <Card className="p-4 text-center bg-green-50">
          <div className="text-2xl font-bold text-green-700">{stats.accepte}</div>
          <div className="text-sm text-green-600">Accepté</div>
        </Card>
        <Card className="p-4 text-center bg-red-50">
          <div className="text-2xl font-bold text-red-700">{stats.refuse}</div>
          <div className="text-sm text-red-600">Refusé</div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFilterStatut('all')}
          variant={filterStatut === 'all' ? 'primary' : 'outline'}
          className="text-sm"
        >
          Tous ({stats.total})
        </Button>
        <Button
          onClick={() => setFilterStatut('nouveau')}
          variant={filterStatut === 'nouveau' ? 'primary' : 'outline'}
          className="text-sm"
        >
          Nouveau ({stats.nouveau})
        </Button>
        <Button
          onClick={() => setFilterStatut('en_cours')}
          variant={filterStatut === 'en_cours' ? 'primary' : 'outline'}
          className="text-sm"
        >
          En cours ({stats.en_cours})
        </Button>
        <Button
          onClick={() => setFilterStatut('accepte')}
          variant={filterStatut === 'accepte' ? 'primary' : 'outline'}
          className="text-sm"
        >
          Accepté ({stats.accepte})
        </Button>
        <Button
          onClick={() => setFilterStatut('refuse')}
          variant={filterStatut === 'refuse' ? 'primary' : 'outline'}
          className="text-sm"
        >
          Refusé ({stats.refuse})
        </Button>
      </div>

      {/* Liste des candidatures */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Liste */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredCandidatures.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Aucune candidature</p>
            </Card>
          ) : (
            filteredCandidatures.map((candidature) => (
              <Card
                key={candidature.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedCandidature?.id === candidature.id ? 'ring-2 ring-[#F77F00]' : ''
                }`}
                onClick={() => {
                  setSelectedCandidature(candidature);
                  setNotesAdmin(candidature.notes_admin || '');
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {candidature.prenom} {candidature.nom}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      {candidature.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="w-4 h-4" />
                      {candidature.telephone}
                    </div>
                  </div>
                  {getStatutBadge(candidature.statut)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(candidature.created_at).toLocaleDateString('fr-FR')}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Détails */}
        {selectedCandidature ? (
          <div className="space-y-4">
            {/* En-tête avec actions de qualification */}
            <Card className="p-6 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCandidature.prenom} {selectedCandidature.nom}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-[#F77F00]" />
                      <a href={`mailto:${selectedCandidature.email}`} className="hover:text-[#F77F00] hover:underline">
                        {selectedCandidature.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-[#F77F00]" />
                      <a href={`tel:${selectedCandidature.telephone}`} className="hover:text-[#F77F00] hover:underline">
                        {selectedCandidature.telephone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Candidature reçue le {new Date(selectedCandidature.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                {getStatutBadge(selectedCandidature.statut)}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Qualifier cette candidature :</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => updateStatut(selectedCandidature.id, 'en_cours')}
                    className={`${
                      selectedCandidature.statut === 'en_cours'
                        ? 'bg-yellow-500 text-white border-yellow-600'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                    } border-2`}
                    disabled={selectedCandidature.statut === 'en_cours'}
                  >
                    <Clock className="w-4 h-4" />
                    En cours
                  </Button>
                  <Button
                    onClick={() => updateStatut(selectedCandidature.id, 'accepte')}
                    className={`${
                      selectedCandidature.statut === 'accepte'
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                    } border-2`}
                    disabled={selectedCandidature.statut === 'accepte'}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accepter
                  </Button>
                  <Button
                    onClick={() => updateStatut(selectedCandidature.id, 'refuse')}
                    className={`${
                      selectedCandidature.statut === 'refuse'
                        ? 'bg-red-500 text-white border-red-600'
                        : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                    } border-2`}
                    disabled={selectedCandidature.statut === 'refuse'}
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            </Card>

            {/* Détails de la candidature */}
            <Card className="p-6 max-h-[500px] overflow-y-auto">
              <div className="space-y-6">
                {/* Expériences */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-blue-700" />
                    <h4 className="font-bold text-blue-900">Expériences similaires</h4>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedCandidature.experiences_similaires}
                  </p>
                </div>

                {/* Méthode de travail */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-purple-700" />
                    <h4 className="font-bold text-purple-900">Méthode pour éviter les erreurs</h4>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedCandidature.methode_eviter_erreurs}
                  </p>
                </div>

                {/* Disponibilité */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-700" />
                    <h4 className="font-bold text-green-900">Disponibilité quotidienne</h4>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedCandidature.disponibilite_quotidienne}
                  </p>
                </div>

                {/* Motivations */}
                {selectedCandidature.motivations && (
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-orange-700" />
                      <h4 className="font-bold text-orange-900">Motivations</h4>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {selectedCandidature.motivations}
                    </p>
                  </div>
                )}

                {/* Accord paiement */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  selectedCandidature.accord_paiement_tarif
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={`w-5 h-5 ${selectedCandidature.accord_paiement_tarif ? 'text-green-700' : 'text-red-700'}`} />
                    <h4 className={`font-bold ${selectedCandidature.accord_paiement_tarif ? 'text-green-900' : 'text-red-900'}`}>
                      Accord paiement / tarif
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCandidature.accord_paiement_tarif ? (
                      <>
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">
                          A accepté les conditions (1€/h via Taptap)
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-700">
                          N'a pas accepté les conditions
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes administrateur */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-700" />
                    <h4 className="font-bold text-gray-900">Notes administrateur</h4>
                  </div>
                  <textarea
                    value={notesAdmin}
                    onChange={(e) => setNotesAdmin(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent mb-2"
                    placeholder="Ajoutez vos notes sur ce candidat (impressions, points forts, points d'attention...)..."
                  />
                  <Button
                    onClick={() => updateNotes(selectedCandidature.id)}
                    className="bg-[#F77F00] text-white hover:bg-[#E06F00] w-full"
                  >
                    <FileText className="w-4 h-4" />
                    Enregistrer les notes
                  </Button>
                </div>

                {/* Métadonnées */}
                <div className="text-xs text-gray-500 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                  <div className="flex justify-between">
                    <span>Reçu le : {new Date(selectedCandidature.created_at).toLocaleString('fr-FR')}</span>
                    <span>Modifié le : {new Date(selectedCandidature.updated_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="mt-1 text-gray-400">ID: {selectedCandidature.id}</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Sélectionnez une candidature</p>
            <p className="text-gray-400 text-sm mt-2">
              Cliquez sur une candidature dans la liste pour voir les détails
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
