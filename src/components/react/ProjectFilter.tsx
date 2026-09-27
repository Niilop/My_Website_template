/**
 * Example React island: filters a project list by tag.
 * The full list is rendered on the server, so it works without JavaScript; filtering is an enhancement.
 * Delete this file (and its usage in src/pages/projects/index.astro) if you do not need it.
 */
import { useId, useState } from 'react';

export interface FilterableProject {
  id: string;
  title: string;
  summary: string;
  href: string;
  tags: string[];
  image?: { src: string; srcset: string; width: number; height: number; alt: string };
}

interface Props {
  projects: FilterableProject[];
  allLabel?: string;
}

export default function ProjectFilter({ projects, allLabel = 'All' }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const labelId = useId();
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();
  const visible = active ? projects.filter((project) => project.tags.includes(active)) : projects;

  return (
    <div className="project-filter">
      {tags.length > 1 && (
        <div className="filter-bar" role="group" aria-labelledby={labelId}>
          <span id={labelId} className="muted">
            Filter by tag:
          </span>
          {[null, ...tags].map((tag) => (
            <button
              key={tag ?? '__all'}
              type="button"
              className="filter-button"
              aria-pressed={active === tag}
              onClick={() => setActive(tag)}
            >
              {tag ?? allLabel}
            </button>
          ))}
        </div>
      )}
      <p className="visually-hidden" role="status">
        {`Showing ${visible.length} of ${projects.length} projects`}
      </p>
      <ul className="grid">
        {visible.map((project) => (
          <li key={project.id}>
            <article className="card card--link">
              {project.image && (
                <img
                  className="card-image"
                  src={project.image.src}
                  srcSet={project.image.srcset}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  width={project.image.width}
                  height={project.image.height}
                  alt={project.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="card-body">
                <h2 className="card-title">
                  <a href={project.href}>{project.title}</a>
                </h2>
                <p className="muted">{project.summary}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
