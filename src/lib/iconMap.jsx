import {
  Droplet, BookOpen, Dumbbell, Moon, Brain, Footprints, Apple, PenLine, Music,
  Sun, Heart, Coffee, Ban, Wallet, Palette, Code2, Languages, Bike, Waves,
  Flower2, Smile, Guitar, Camera, Leaf, Circle,
} from 'lucide-react';

const ICON_MAP = {
  Droplet, BookOpen, Dumbbell, Moon, Brain, Footprints, Apple, PenLine, Music,
  Sun, Heart, Coffee, Ban, Wallet, Palette, Code2, Languages, Bike, Waves,
  Flower2, Smile, Guitar, Camera, Leaf, Circle,
};

function HabitIcon({ name, ...props }) {
  const Cmp = ICON_MAP[name] || Circle;
  return <Cmp {...props} />;
}

export { ICON_MAP, HabitIcon };
