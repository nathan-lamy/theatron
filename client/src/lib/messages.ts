export const ERRORS = {
  INVALID_LINK: {
    title: "Le lien est invalide ou a expiré",
    message:
      "Vérifiez que vous avez bien cliqué sur le lien reçu par mail. Si vous avez déjà cliqué sur le lien, il est possible qu'il ait expiré. Si le problème persiste, veuillez contacter votre professeur par mail.",
  },
  EXPIRED_LINK: {
    title: "Vous n'avez pas confirmé votre inscription à temps",
    message:
      "Votre place a été libérée et sera attribuée à la prochaine personne sur la liste d'attente. Si vous vous êtes désinscrit volontairement, vous pouvez ignorer ce message.",
  },
  NETWORK: {
    title: "Erreur de connexion",
    message:
      "Vérifiez que vous êtes bien connecté à internet. Si le problème persiste, le serveur est peut-être en maintenance. Veuillez réessayer plus tard.",
  },
  NOT_FOUND: {
    title: "Page introuvable",
    message:
      "Oh non ! Il semble que vous vous soyez égaré(e) dans les méandres du cyberespace. La page que vous cherchez semble avoir pris des vacances imprévues. Ne vous inquiétez pas, même les meilleures pages ont besoin d'une pause de temps en temps.",
  },
  ON_WAIT_LIST: {
    title: "Vous êtes sur liste d'attente",
    message:
      "Vous ne pouvez pas effectuer cette action car vous êtes sur la liste d'attente pour ce spectacle. Vous recevrez un mail si une place se libère.",
  },
  EMAIL_ALREADY_REGISTERED: {
    title: "Cette adresse email est déjà enregistrée",
    message:
      "Vous êtes déjà inscrit(e) au théâtre. Si vous pensez que c'est une erreur, veuillez contacter votre professeur par mail.",
  },
};

export const SUCCESS = {
  REGISTRATION_CONFIRMED: {
    title: "Votre inscription au spectacle est confirmée !",
    message:
      "Si vous souhaitez annuler votre inscription dans le futur, vous pourrez le faire en revenant sur ce lien, reçu par mail. Vous pouvez dès à présent fermer cette page. A bientôt !",
  },
  REGISTRATION_CANCELED: {
    title: "Votre inscription au spectacle a été annulée",
    message:
      "Je vous remercie d'avoir prévenu. Votre place a été libérée et sera attribuée à la prochaine personne sur la liste d'attente.",
  },
  REGISTERED: {
    title:
      "Vous êtes bien pré-inscrit(e) pour le(s) spectacle(s) sélectionné(s) !",
    message:
      "Vous recevrez un mail de confirmation dans quelques instants. Vous devrez confirmer votre inscription en cliquant sur le lien que vous recevrez par mail deux mois avant chaque spectacle, sous peine de perdre votre place.",
  },
};
