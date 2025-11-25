/*
  # Suppression des index inutilisés
  
  1. Index supprimés
    - idx_markets_status
    - idx_bpus_user_id
    - idx_knowledge_files_user_id
    - idx_technical_memories_market_id
    - idx_technical_memories_user_id
    - idx_memo_sections_memory_id
    - idx_memo_sections_market_id
    - idx_market_documents_market_id
    
  2. Raison
    - Ces index ne sont pas utilisés selon les statistiques
    - Réduire l'overhead de maintenance
    - Améliorer les performances d'écriture
*/

DROP INDEX IF EXISTS idx_markets_status;
DROP INDEX IF EXISTS idx_bpus_user_id;
DROP INDEX IF EXISTS idx_knowledge_files_user_id;
DROP INDEX IF EXISTS idx_technical_memories_market_id;
DROP INDEX IF EXISTS idx_technical_memories_user_id;
DROP INDEX IF EXISTS idx_memo_sections_memory_id;
DROP INDEX IF EXISTS idx_memo_sections_market_id;
DROP INDEX IF EXISTS idx_market_documents_market_id;