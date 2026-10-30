import {
  type EducationEntry,
  type EducationId,
  type EducationText,
  educationBase,
} from "@/data/education";
import {
  type PointOfInterest,
  type PointOfInterestId,
  type PointOfInterestText,
  pointOfInterestBase,
} from "@/data/points-of-interest";
import { type ProfileLink, type ProfileLinkId, profileLinkBase } from "@/data/profile";
import { type Project, type ProjectId, type ProjectText, projectBase } from "@/data/projects";
import { type StackGroup, type StackGroupId, stackGroupBase } from "@/data/stack";

export function buildProfileLinks(labels: Record<ProfileLinkId, string>): ProfileLink[] {
  return profileLinkBase.map((link) => ({ ...link, label: labels[link.id] }));
}

export function buildProjects(texts: Record<ProjectId, ProjectText>): Project[] {
  return projectBase.map((project) => ({ ...project, ...texts[project.id] }));
}

export function buildStackGroups(labels: Record<StackGroupId, string>): StackGroup[] {
  return stackGroupBase.map((group) => ({ ...group, label: labels[group.id] }));
}

export function buildEducation(texts: Record<EducationId, EducationText>): EducationEntry[] {
  return educationBase.map((entry) => ({ ...entry, ...texts[entry.id] }));
}

export function buildPointsOfInterest(
  texts: Record<PointOfInterestId, PointOfInterestText>,
): PointOfInterest[] {
  return pointOfInterestBase.map((point) => ({ ...point, ...texts[point.id] }));
}
