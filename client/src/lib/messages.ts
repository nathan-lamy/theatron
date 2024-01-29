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
};
