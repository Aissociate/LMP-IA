import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Users, Mail, Phone, Calendar, CheckCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';

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

  useEffect(() => {
    loadCandidatures();
  }, []);

  const loadCandidatures = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidatures(data || []);
    } catch (error) {
      console.error('Error loading candidatures:', error);
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
        {selectedCandidature && (
          <Card className="p-6 max-h-[600px] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedCandidature.prenom} {selectedCandidature.nom}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedCandidature.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    {selectedCandidature.telephone}
                  </div>
                </div>
                {getStatutBadge(selectedCandidature.statut)}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => updateStatut(selectedCandidature.id, 'en_cours')}
                  variant="outline"
                  className="text-sm"
                  disabled={selectedCandidature.statut === 'en_cours'}
                >
                  <Clock className="w-4 h-4" />
                  En cours
                </Button>
                <Button
                  onClick={() => updateStatut(selectedCandidature.id, 'accepte')}
                  variant="outline"
                  className="text-sm text-green-700 border-green-300"
                  disabled={selectedCandidature.statut === 'accepte'}
                >
                  <CheckCircle className="w-4 h-4" />
                  Accepter
                </Button>
                <Button
                  onClick={() => updateStatut(selectedCandidature.id, 'refuse')}
                  variant="outline"
                  className="text-sm text-red-700 border-red-300"
                  disabled={selectedCandidature.statut === 'refuse'}
                >
                  <XCircle className="w-4 h-4" />
                  Refuser
                </Button>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Expériences similaires</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedCandidature.experiences_similaires}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Méthode pour éviter les erreurs</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedCandidature.methode_eviter_erreurs}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Disponibilité quotidienne</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedCandidature.disponibilite_quotidienne}
                </p>
              </div>

              {selectedCandidature.motivations && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Motivations</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {selectedCandidature.motivations}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Accord paiement / tarif</h4>
                <p className={`text-sm font-semibold ${selectedCandidature.accord_paiement_tarif ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCandidature.accord_paiement_tarif ? '✓ Accepté' : '✗ Non accepté'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes administrateur</h4>
                <textarea
                  value={notesAdmin}
                  onChange={(e) => setNotesAdmin(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="Ajoutez des notes sur cette candidature..."
                />
                <Button
                  onClick={() => updateNotes(selectedCandidature.id)}
                  className="mt-2 bg-[#F77F00] text-white hover:bg-[#E06F00]"
                >
                  Enregistrer les notes
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <div>Reçu le : {new Date(selectedCandidature.created_at).toLocaleString('fr-FR')}</div>
                <div>Modifié le : {new Date(selectedCandidature.updated_at).toLocaleString('fr-FR')}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
