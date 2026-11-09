
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

function CategoryCard({
  title,
  description,
  icon: Icon,
}: CategoryCardProps) {
  return (
    <article className="landing-category-card">
      <div className="landing-category-icon">
        <Icon size={30} strokeWidth={1.8} />
      </div>

      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export default CategoryCard;

