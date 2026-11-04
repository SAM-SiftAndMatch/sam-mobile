import type { Job, Proposal, User } from '../../../types/domain';
export function selectOpenJobs(jobs: Job[], query = '', category = 'All') {
  const search = query.trim().toLocaleLowerCase('vi-VN');
  return jobs.filter(
    (job) =>
      job.status === 'open' &&
      (category === 'All' || job.category === category) &&
      (!search ||
        [job.title, job.description, ...job.skills].some((value) =>
          value.toLocaleLowerCase('vi-VN').includes(search),
        )),
  );
}
export function selectUserProjects(jobs: Job[], proposals: Proposal[], user: User | null) {
  if (!user) return [];
  if (user.role === 'customer') return jobs.filter((job) => job.customerId === user.id);
  const accepted = new Set(
    proposals
      .filter((proposal) => proposal.freelancerId === user.id && proposal.status === 'accepted')
      .map((proposal) => proposal.jobId),
  );
  return jobs.filter((job) => accepted.has(job.id));
}
export function selectUserProposals(proposals: Proposal[], user: User | null, jobId?: string) {
  if (!user) return [];
  return proposals.filter(
    (proposal) =>
      (user.role === 'freelancer'
        ? proposal.freelancerId === user.id
        : proposal.customerId === user.id) &&
      (!jobId || proposal.jobId === jobId),
  );
}
