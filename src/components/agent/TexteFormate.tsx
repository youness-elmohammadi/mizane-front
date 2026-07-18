import { Fragment } from 'react';

/**
 * Rendu léger du texte de l'agent : **gras**, retours à la ligne et listes « - ».
 *
 * Volontairement SANS dangerouslySetInnerHTML : la réponse de l'agent viendra
 * d'un modèle de langage et peut contenir du contenu arbitraire. On construit
 * donc des éléments React, ce qui rend toute injection HTML impossible.
 */

interface TexteFormateProps {
  texte: string;
}

export default function TexteFormate({ texte }: TexteFormateProps) {
  const lignes = texte.split('\n');

  return (
    <>
      {lignes.map((ligne, index) => {
        // Ligne vide → espacement entre paragraphes
        if (ligne.trim() === '') {
          return <div key={index} className="h-2" />;
        }

        // Élément de liste
        if (ligne.trimStart().startsWith('- ')) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span className="text-gray-400 flex-shrink-0">•</span>
              <span>{rendreGras(ligne.trimStart().slice(2))}</span>
            </div>
          );
        }

        return <div key={index}>{rendreGras(ligne)}</div>;
      })}
    </>
  );
}

/** Transforme les segments **…** en <strong>. */
function rendreGras(ligne: string) {
  // Le groupe capturant conserve les délimiteurs dans le tableau résultant,
  // ce qui permet de distinguer les segments gras des segments normaux.
  const segments = ligne.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{segment}</Fragment>;
  });
}
