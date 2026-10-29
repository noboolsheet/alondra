import {
  AudioLines,
  Baby,
  Guitar,
  Mic,
  Music2,
  Music3,
  Music4,
  Piano,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Iconos de disciplina y de formato, indexados por la `key` del diccionario.
 *
 * Estaban duplicados en tres sitios (la página de formatos, la sección de
 * formatos de la portada y la rejilla de instrumentos) y uno de ellos indexaba
 * **por posición**, así que reordenar `programs.disciplines` cambiaba los
 * iconos en silencio. Indexar por clave quita ese modo de fallo.
 */
export const DISCIPLINE_ICON: Record<string, LucideIcon> = {
  piano: Piano,
  violin: Music2,
  flute: Music4,
  guitar: Guitar,
  bass: Music3,
  voice: Mic,
  soundArt: AudioLines,
};

export const FORMAT_ICON: Record<string, LucideIcon> = {
  individual: User,
  pianoLab: Users,
  littleMozart: Baby,
};

export const disciplineIcon = (key: string): LucideIcon => DISCIPLINE_ICON[key] ?? Music3;
export const formatIcon = (key: string): LucideIcon => FORMAT_ICON[key] ?? User;
