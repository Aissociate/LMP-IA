import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Plus, 
  ThumbsUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Lightbulb,
  Bug,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Eye,
  Calendar,
  Trash2,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { FeatureComment } from '../../types';
import { SecurityValidation } from '../../lib/securityValidation';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  type: 'bug_fix' | 'new_feature' | 'improvement';
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  votes_count: number;
  user_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  user_has_voted: boolean;
}

interface FeatureWithComments extends FeatureRequest {
  comments: FeatureComment[];
  comments_count: number;
  show_comments: boolean;
}

interface FilterState {
  status: string | 'all';
  type: string | 'all';
  sortBy: 'created_at' | 'votes_count' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

const ALL_STATUSES = ['all', 'proposed', 'approved', 'in_progress', 'completed', 'rejected'];
const ALL_TYPES = ['all', 'bug_fix', 'new_feature', 'improvement'];

const statusConfig = {
  proposed: { 
    label: 'Proposé', 
    icon: Lightbulb, 
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    darkColor: 'text-blue-400 bg-blue-900/20 border-blue-700'
  },
  approved: { 
    label: 'Approuvé', 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-50 border-green-200',
    darkColor: 'text-green-400 bg-green-900/20 border-green-700'
  },
  in_progress: { 
    label: 'En cours', 
    icon: Clock, 
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    darkColor: 'text-orange-400 bg-orange-900/20 border-orange-700'
  },
  completed: { 
    label: 'Terminé', 
    icon: CheckCircle, 
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    darkColor: 'text-emerald-400 bg-emerald-900/20 border-emerald-700'
  },
  rejected: { 
    label: 'Rejeté', 
    icon: XCircle, 
    color: 'text-red-600 bg-red-50 border-red-200',
    darkColor: 'text-red-400 bg-red-900/20 border-red-700'
  }
};

const typeConfig = {
  bug_fix: { label: 'Bug Fix', icon: Bug, color: 'text-red-600 bg-red-100' },
  new_feature: { label: 'Nouvelle fonctionnalité', icon: Sparkles, color: 'text-purple-600 bg-purple-100' },
  improvement: { label: 'Amélioration', icon: TrendingUp, color: 'text-blue-600 bg-blue-100' }
};

export const Labo: React.FC = () => {
  const { isDark } = useTheme();
  const { user, isAdmin } = useAuth();
  const [features, setFeatures] = useState<FeatureWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    type: 'new_feature' as const
  });
  const [hasNewEntries, setHasNewEntries] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureWithComments[]>([]);
  const [newComments, setNewComments] = useState<{ [featureId: string]: string }>({});
  const [commentImages, setCommentImages] = useState<{ [featureId: string]: File | null }>({});
  const [submittingComments, setSubmittingComments] = useState<{ [featureId: string]: boolean }>({});

  useEffect(() => {
    fetchFeatures();
    checkForNewEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [features, filters]);

  const fetchFeatures = async () => {
    try {
      console.log('[Labo] 🔄 Rechargement des propositions...');
      
      // Récupérer les propositions de fonctionnalités
      const { data: featuresData, error: featuresError } = await supabase
        .from('feature_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (featuresError) {
        console.error('[Labo] ❌ Erreur lors du chargement des propositions:', featuresError);
        throw featuresError;
      }
      
      if (!featuresData) return;

      console.log(`[Labo] 📋 ${featuresData.length} propositions chargées depuis la base`);
      
      // Extraire les IDs utilisateurs uniques
      const userIds = [...new Set(featuresData.map(feature => feature.user_id))];

      // Récupérer les profils utilisateurs
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Récupérer TOUS les votes pour ces propositions
      const { data: votesData, error: votesError } = await supabase
        .from('feature_votes')
        .select('feature_request_id, user_id')
        .in('feature_request_id', featuresData.map(f => f.id));

      if (votesError) throw votesError;

      // Récupérer les commentaires pour ces propositions
      const { data: commentsData, error: commentsError } = await supabase
        .from('feature_comments')
        .select('id, feature_request_id, user_id, content, image_url, created_at, updated_at, is_deleted')
        .in('feature_request_id', featuresData.map(f => f.id))
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      console.log(`[Labo] 👥 ${userProfiles?.length || 0} profils utilisateurs trouvés`);
      console.log(`[Labo] 🗳️ ${votesData?.length || 0} votes chargés`);
      console.log(`[Labo] 💬 ${commentsData?.length || 0} commentaires chargés`);
      
      // Créer les maps pour la recherche rapide
      const profilesMap = new Map();
      userProfiles?.forEach(profile => {
        profilesMap.set(profile.user_id, profile.full_name);
      });

      const votesMap = new Map();
      votesData?.forEach(vote => {
        if (!votesMap.has(vote.feature_request_id)) {
          votesMap.set(vote.feature_request_id, []);
        }
        votesMap.get(vote.feature_request_id).push(vote.user_id);
      });

      const commentsMap = new Map();
      commentsData?.forEach(comment => {
        if (!commentsMap.has(comment.feature_request_id)) {
          commentsMap.set(comment.feature_request_id, []);
        }
        commentsMap.get(comment.feature_request_id).push({
          ...comment,
          user_name: profilesMap.get(comment.user_id) || 'Utilisateur'
        });
      });

      // Fusionner les données côté client
      const featuresWithData = featuresData.map(feature => ({
        ...feature,
        user_name: profilesMap.get(feature.user_id) || 'Utilisateur',
        user_has_voted: votesMap.get(feature.id)?.includes(user?.id) || false,
        comments: commentsMap.get(feature.id) || [],
        comments_count: commentsMap.get(feature.id)?.length || 0,
        show_comments: false
      }));

      console.log(`[Labo] ✅ ${featuresWithData.length} propositions finales avec votes et commentaires`);
      setFeatures(featuresWithData);
      
    } catch (error) {
      console.error('[Labo] ❌ Erreur générale lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...features];

    // Filtrer par terme de recherche
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(feature => 
        feature.title.toLowerCase().includes(searchLower) ||
        feature.description?.toLowerCase().includes(searchLower) ||
        feature.user_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(feature => feature.status === filters.status);
    }

    // Filtrer par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(feature => feature.type === filters.type);
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'votes_count':
          aValue = a.votes_count;
          bValue = b.votes_count;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredFeatures(filtered);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      searchTerm: ''
    });
  };

  const checkForNewEntries = async () => {
    try {
      // Vérifier s'il y a des entrées dans les dernières 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('feature_requests')
        .select('id')
        .gte('created_at', yesterday.toISOString())
        .limit(1);

      if (error) throw error;
      setHasNewEntries((data?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking for new entries:', error);
    }
  };

  const handleCreateFeature = async () => {
    if (!user || !newFeature.title.trim()) return;

    try {
      const { error } = await supabase.from('feature_requests').insert({
        title: newFeature.title,
        description: newFeature.description,
        type: newFeature.type,
        status: 'proposed',
        votes_count: 0,
        user_id: user.id
      });

      if (error) throw error;

      setNewFeature({ title: '', description: '', type: 'new_feature' });
      setShowNewForm(false);
      fetchFeatures();
    } catch (error) {
      console.error('Error creating feature:', error);
    }
  };

  const handleVote = async (featureId: string) => {
    if (!user) return;

    try {
      const feature = features.find(f => f.id === featureId);
      if (!feature) return;

      if (feature.user_has_voted) {
        // Retirer le vote
        await supabase
          .from('feature_votes')
          .delete()
          .match({ feature_request_id: featureId, user_id: user.id });

        await supabase
          .from('feature_requests')
          .update({ votes_count: Math.max(0, feature.votes_count - 1) })
          .eq('id', featureId);
      } else {
        // Ajouter le vote
        try {
          await supabase
            .from('feature_votes')
            .insert({ feature_request_id: featureId, user_id: user.id });
        } catch (insertError: any) {
          // Si erreur de contrainte unique (utilisateur a déjà voté), ignorer
          if (insertError?.code === '23505') {
            console.warn('User has already voted for this feature');
            fetchFeatures(); // Synchroniser l'état avec la base de données
            return;
          }
          throw insertError;
        }

        await supabase
          .from('feature_requests')
          .update({ votes_count: feature.votes_count + 1 })
          .eq('id', featureId);
      }

      fetchFeatures();
    } catch (error) {
      console.error('Error voting:', error);
      fetchFeatures(); // Synchroniser l'état en cas d'erreur
    }
  };

  const handleStatusUpdate = async (featureId: string, newStatus: string) => {
    if (!isAdmin) return;

    try {
      await supabase
        .from('feature_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', featureId);

      fetchFeatures();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette demande ?')) return;

    try {
      console.log('Suppression de la demande:', featureId);
      
      // 1. Supprimer d'abord TOUS les votes associés
      const { error: votesError } = await supabase
        .from('feature_votes')
        .delete()
        .eq('feature_request_id', featureId);

      if (votesError) {
        console.error('Erreur suppression votes:', votesError);
        throw new Error(`Impossible de supprimer les votes: ${votesError.message}`);
      }

      // 2. Supprimer définitivement la demande de fonctionnalité
      const { error: featureError } = await supabase
        .from('feature_requests')
        .delete()
        .eq('id', featureId);

      if (featureError) {
        console.error('Erreur suppression feature:', featureError);
        throw featureError;
      }

      console.log('✅ Demande et votes supprimés définitivement');
      
      // 3. Supprimer immédiatement de l'affichage local
      setFeatures(prev => prev.filter(f => f.id !== featureId));
      setFilteredFeatures(prev => prev.filter(f => f.id !== featureId));
      
      // 4. Rechargement complet pour synchroniser avec la base
      setTimeout(() => {
        fetchFeatures();
      }, 100);
      
    } catch (error) {
      console.error('Error deleting feature:', error);
      alert(`❌ Suppression échouée: ${error.message || 'Erreur inconnue'}\n\nLa proposition pourrait toujours être visible.`);
      // Recharger en cas d'erreur pour synchroniser l'affichage
      fetchFeatures();
    }
  };

  const toggleComments = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, show_comments: !feature.show_comments }
        : feature
    ));
  };

  const handleAddComment = async (featureId: string) => {
    const content = newComments[featureId]?.trim();
    const imageFile = commentImages[featureId];
    
    if (!user || (!content && !imageFile)) return;

    // Validations de sécurité
    if (content && content.length > 2000) {
      alert('Commentaire trop long (max 2000 caractères)');
      return;
    }

    if (imageFile) {
      if (!SecurityValidation.validateFileType(imageFile.name, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        alert('Type d\'image non autorisé (JPG, PNG, GIF, WebP uniquement)');
        return;
      }
      
      if (!SecurityValidation.validateFileSize(imageFile.size, 5)) {
        alert('Image trop volumineuse (max 5MB)');
        return;
      }
    }

    setSubmittingComments(prev => ({ ...prev, [featureId]: true }));

    try {
      let imageUrl = null;

      // Upload de l'image si présente
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `feature-comments/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Créer le commentaire
      const { error } = await supabase.from('feature_comments').insert({
        feature_request_id: featureId,
        user_id: user.id,
        content: content || '',
        image_url: imageUrl
      });

      if (error) throw error;

      // Réinitialiser le formulaire
      setNewComments(prev => ({ ...prev, [featureId]: '' }));
      setCommentImages(prev => ({ ...prev, [featureId]: null }));
      
      // Ouvrir automatiquement les commentaires si fermés
      setFeatures(prev => prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, show_comments: true }
          : feature
      ));

      // Recharger les données
      fetchFeatures();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComments(prev => ({ ...prev, [featureId]: false }));
    }
  };

  const handleDeleteComment = async (commentId: string, featureId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      const { error } = await supabase
        .from('feature_comments')
        .update({ is_deleted: true })
        .eq('id', commentId);

      if (error) throw error;
      fetchFeatures();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleImageUpload = (featureId: string, file: File | null) => {
    setCommentImages(prev => ({ ...prev, [featureId]: file }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-6">
          <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
          <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg relative">
            <Beaker className="w-8 h-8 text-white" />
            {hasNewEntries && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Labo
              {hasNewEntries && (
                <span className="ml-3 text-sm bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                  Nouveau
                </span>
              )}
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Proposez et votez pour de nouvelles fonctionnalités
            </p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4 transition-colors duration-200`}>
          <div className="flex items-center gap-2">
            <Lightbulb className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-medium ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>Zone d'innovation collaborative</span>
          </div>
          <p className={`${isDark ? 'text-purple-400' : 'text-purple-700'} text-sm mt-1`}>
            Participez à l'évolution de Le Marché Public.fr en proposant des idées et en votant pour vos fonctionnalités préférées.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Fonctionnalités ({features.length})
            {filters.status !== 'all' || filters.type !== 'all' || filters.searchTerm ? ` • Filtré: ${filteredFeatures.length}` : ''}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = features.filter(f => f.status === status).length;
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${isDark ? config.darkColor.split(' ')[1] : config.color.split(' ')[1]}`}></div>
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {config.label}: {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-purple-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filtres
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Proposer une idée
          </button>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 mb-6 border ${isDark ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Recherche */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Rechercher
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                placeholder="Titre, description, auteur..."
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              />
            </div>

            {/* Statut */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              >
                <option value="all">Tous les statuts</option>
                <option value="proposed">Proposé</option>
                <option value="approved">Approuvé</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              >
                <option value="all">Tous les types</option>
                <option value="bug_fix">Correction de bug</option>
                <option value="new_feature">Nouvelle fonctionnalité</option>
                <option value="improvement">Amélioration</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Trier par
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                >
                  <option value="created_at">Date création</option>
                  <option value="updated_at">Dernière MAJ</option>
                  <option value="votes_count">Votes</option>
                </select>
                <button
                  onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                    isDark ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  title={filters.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredFeatures.length} résultat{filteredFeatures.length > 1 ? 's' : ''} sur {features.length}
            </div>
            <button
              onClick={resetFilters}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Indicateurs de filtres actifs */}
      {(filters.status !== 'all' || filters.type !== 'all' || filters.searchTerm) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.searchTerm && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
              <span>Recherche: "{filters.searchTerm}"</span>
              <button onClick={() => setFilters({...filters, searchTerm: ''})} className="hover:text-red-500">×</button>
            </div>
          )}
          {filters.status !== 'all' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              <span>Statut: {statusConfig[filters.status]?.label}</span>
              <button onClick={() => setFilters({...filters, status: 'all'})} className="hover:text-red-500">×</button>
            </div>
          )}
          {filters.type !== 'all' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
              <span>Type: {typeConfig[filters.type]?.label}</span>
              <button onClick={() => setFilters({...filters, type: 'all'})} className="hover:text-red-500">×</button>
            </div>
          )}
        </div>
      )}

      {/* Formulaire nouvelle proposition */}
      {showNewForm && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 mb-6 transition-colors duration-200`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Nouvelle proposition</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Type
                </label>
                <select
                  value={newFeature.type}
                  onChange={(e) => setNewFeature({ ...newFeature, type: e.target.value as any })}
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                >
                  <option value="new_feature">Nouvelle fonctionnalité</option>
                  <option value="improvement">Amélioration</option>
                  <option value="bug_fix">Correction de bug</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  placeholder="Ex: Coffre-fort virtuel pour documents"
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Description détaillée
              </label>
              <textarea
                rows={4}
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Décrivez votre idée en détail..."
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none`}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewForm(false)}
                className={`px-4 py-2 ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateFeature}
                disabled={!newFeature.title.trim()}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                Proposer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des fonctionnalités */}
      <div className="space-y-4">
        {filteredFeatures.length === 0 && features.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center transition-colors duration-200`}>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Beaker className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucune proposition</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Soyez le premier à proposer une nouvelle fonctionnalité</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Proposer une idée
            </button>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center transition-colors duration-200`}>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucun résultat</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Aucune fonctionnalité ne correspond aux filtres appliqués</p>
            <button onClick={resetFilters} className="text-purple-600 hover:text-purple-700 font-medium">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredFeatures.map((feature) => {
            const status = statusConfig[feature.status];
            const type = typeConfig[feature.type];
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;

            return (
              <div
                key={feature.id}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-lg hover:transform hover:scale-105`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${isDark ? type.color.replace('bg-', 'bg-').replace('text-', 'text-') + '/20 border ' + type.color.replace('bg-', 'border-').replace('text-', 'border-') : type.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full flex items-center gap-1 border ${isDark ? status.darkColor : status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{status.label}</span>
                      </div>
                    </div>
                    
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {feature.title}
                    </h3>
                    
                    {feature.description && (
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{feature.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{feature.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(feature.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                {/* Section commentaires */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleComments(feature.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{feature.comments_count} commentaire{feature.comments_count > 1 ? 's' : ''}</span>
                      {feature.show_comments ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Liste des commentaires */}
                  {feature.show_comments && (
                    <div className="space-y-3">
                      {/* Commentaires existants */}
                      {feature.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-200`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center`}>
                                <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {comment.user_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user_name}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            {(isAdmin || comment.user_id === user?.id) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, feature.id)}
                                className={`text-xs ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          
                          {comment.content && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              {comment.content}
                            </p>
                          )}
                          
                          {comment.image_url && (
                            <div className="mt-2">
                              <img
                                src={comment.image_url}
                                alt="Image du commentaire"
                                className="max-w-xs max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(comment.image_url, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Formulaire nouveau commentaire */}
                      <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'} transition-colors duration-200`}>
                        <div className="space-y-3">
                          <textarea
                            value={newComments[feature.id] || ''}
                            onChange={(e) => setNewComments(prev => ({ ...prev, [feature.id]: e.target.value }))}
                            placeholder="Ajouter un commentaire..."
                            rows={3}
                            maxLength={2000}
                            className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm`}
                          />
                          
                          {/* Aperçu image */}
                          {commentImages[feature.id] && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <img
                                src={URL.createObjectURL(commentImages[feature.id]!)}
                                alt="Aperçu"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-purple-700">
                                  {commentImages[feature.id]!.name}
                                </p>
                                <p className="text-xs text-purple-600">
                                  {Math.round(commentImages[feature.id]!.size / 1024)} KB
                                </p>
                              </div>
                              <button
                                onClick={() => handleImageUpload(feature.id, null)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <label className={`cursor-pointer ${isDark ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'} transition-colors`}>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(feature.id, e.target.files?.[0] || null)}
                                />
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </label>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {(newComments[feature.id] || '').length}/2000
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleAddComment(feature.id)}
                              disabled={
                                submittingComments[feature.id] || 
                                (!newComments[feature.id]?.trim() && !commentImages[feature.id])
                              }
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 text-sm"
                            >
                              {submittingComments[feature.id] ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Envoi...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-4 h-4" />
                                  Commenter
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section commentaires */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleComments(feature.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{feature.comments_count} commentaire{feature.comments_count > 1 ? 's' : ''}</span>
                      {feature.show_comments ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Liste des commentaires */}
                  {feature.show_comments && (
                    <div className="space-y-3">
                      {/* Commentaires existants */}
                      {feature.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-200`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center`}>
                                <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {comment.user_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user_name}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            {(isAdmin || comment.user_id === user?.id) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, feature.id)}
                                className={`text-xs ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          
                          {comment.content && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              {comment.content}
                            </p>
                          )}
                          
                          {comment.image_url && (
                            <div className="mt-2">
                              <img
                                src={comment.image_url}
                                alt="Image du commentaire"
                                className="max-w-xs max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(comment.image_url, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Formulaire nouveau commentaire */}
                      <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'} transition-colors duration-200`}>
                        <div className="space-y-3">
                          <textarea
                            value={newComments[feature.id] || ''}
                            onChange={(e) => setNewComments(prev => ({ ...prev, [feature.id]: e.target.value }))}
                            placeholder="Ajouter un commentaire..."
                            rows={3}
                            maxLength={2000}
                            className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm`}
                          />
                          
                          {/* Aperçu image */}
                          {commentImages[feature.id] && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <img
                                src={URL.createObjectURL(commentImages[feature.id]!)}
                                alt="Aperçu"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-purple-700">
                                  {commentImages[feature.id]!.name}
                                </p>
                                <p className="text-xs text-purple-600">
                                  {Math.round(commentImages[feature.id]!.size / 1024)} KB
                                </p>
                              </div>
                              <button
                                onClick={() => handleImageUpload(feature.id, null)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <label className={`cursor-pointer ${isDark ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'} transition-colors`}>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(feature.id, e.target.files?.[0] || null)}
                                />
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </label>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {(newComments[feature.id] || '').length}/2000
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleAddComment(feature.id)}
                              disabled={
                                submittingComments[feature.id] || 
                                (!newComments[feature.id]?.trim() && !commentImages[feature.id])
                              }
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 text-sm"
                            >
                              {submittingComments[feature.id] ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Envoi...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-4 h-4" />
                                  Commenter
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                    {/* Bouton de vote */}
                    <button
                      onClick={() => handleVote(feature.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        feature.user_has_voted
                          ? `bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg`
                          : `${isDark ? 'bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white' : 'bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-600 border border-gray-200'}`
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{feature.votes_count}</span>
                    </button>

                    {/* Menu admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <select
                          value={feature.status}
                          onChange={(e) => handleStatusUpdate(feature.id, e.target.value)}
                          className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="proposed">Proposé</option>
                          <option value="approved">Approuvé</option>
                          <option value="in_progress">En cours</option>
                          <option value="completed">Terminé</option>
                          <option value="rejected">Rejeté</option>
                        </select>
                        <button
                          onClick={() => handleDeleteFeature(feature.id)}
                          className={`p-2 border rounded-lg text-sm transition-colors ${isDark ? 'border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};