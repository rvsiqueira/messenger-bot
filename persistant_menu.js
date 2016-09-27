curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type" : "call_to_actions",
  "thread_state" : "existing_thread",
  "call_to_actions":[
    {
      "type":"postback",
      "title":"Ajuda",
      "payload":"Ajuda"
    },
    {
      "type":"postback",
      "title":"Iniciar Nova Busca",
      "payload":"Iniciar Nova Busca"
    }
  ]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAADzG6iFhkgBAOJb4PyKXl0eJi9rrEP1Va6aZC3odRCzmXRmCLkTCZCnzqvpyZBvZBbyVZAanoVZAwfmL3loNGEaU1uMttjGLvVkOUPN0EvlXtGf7giHUbkZC3HWmy3biI5nRRzGFu91eCmfqZANcJYv3eGIYYLdLfSdtEzuW22O6wZDZD"    