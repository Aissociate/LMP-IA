import { supabase } from '../lib/supabase';
import { BOAMPFavorite } from '../types/boamp';

class FavoritesService {
  async importFavoriteToMarket(favorite: BOAMPFavorite): Promise<{ success: boolean; marketId?: string; error?: string }> {
    try {
      const { data: existingMarket } = await supabase
        .from('markets')
        .select('id')
        .eq('user_id', favorite.user_id)
        .eq('reference', favorite.boamp_reference)
        .single();

      if (existingMarket) {
        return {
          success: false,
          error: 'Ce marché existe déjà dans vos marchés'
        };
      }

      const { data: market, error: marketError } = await supabase
        .from('markets')
        .insert({
          user_id: favorite.user_id,
          title: favorite.title,
          reference: favorite.boamp_reference,
          client: favorite.client || 'Non spécifié',
          description: favorite.description || '',
          deadline: favorite.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: favorite.amount || 0,
          status: 'en_cours'
        })
        .select()
        .single();

      if (marketError) throw marketError;

      const { error: updateError } = await supabase
        .from('boamp_favorites')
        .update({ is_imported_to_markets: true })
        .eq('id', favorite.id);

      if (updateError) throw updateError;

      window.dispatchEvent(new CustomEvent('straticia:market-updated'));

      return {
        success: true,
        marketId: market.id
      };

    } catch (error) {
      console.error('Error importing favorite to market:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'import'
      };
    }
  }

  async getFavorites(userId: string): Promise<BOAMPFavorite[]> {
    try {
      const { data, error } = await supabase
        .from('boamp_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  async removeFavorite(favoriteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('boamp_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
