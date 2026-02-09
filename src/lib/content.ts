/**
 * Content utilities - Index file
 *
 * Re-exports all content-related utilities from modular files.
 * This maintains backward compatibility while organizing code better.
 */

// =============================================================================
// Category Utilities
// =============================================================================
export {
  addCategoryRecursively,
  buildCategoryPath,
  getCategoryArr,
  getCategoryByLink,
  getCategoryLinks,
  getCategoryList,
  getCategoryNameByLink,
  getParentCategory,
} from './content/categories';

// =============================================================================
// Post Utilities
// =============================================================================
export {
  // Core post functions
  getAdjacentSeriesPosts,
  // Featured series functions
  getEnabledSeries,
  getFeaturedCategoryNames,
  getHomeHighlightedPosts,
  getHomePagePosts,
  // Deprecated (kept for backwards compatibility)
  /** @deprecated Use getHomeHighlightedPosts() instead */
  getLatestWeeklyPost,
  getNonFeaturedPosts,
  getNonFeaturedPostsBySticky,
  /** @deprecated Use getNonFeaturedPosts() instead */
  getNonWeeklyPosts,
  /** @deprecated Use getNonFeaturedPostsBySticky() instead */
  getNonWeeklyPostsBySticky,
  getPostCount,
  getPostDescription,
  getPostDescriptionWithSummary,
  getPostLastCategory,
  getPostSummary,
  getPostsByCategory,
  getPostsBySeriesSlug,
  getPostsBySticky,
  getRandomPosts,
  getSeriesBySlug,
  getSeriesPosts,
  getSortedPosts,
  /** @deprecated Use getPostsBySeriesSlug('weekly') instead */
  getWeeklyPosts,
} from './content/posts';

// =============================================================================
// Tag Utilities
// =============================================================================
export { buildTagPath, getAllTags, normalizeTag, tagToSlug } from './content/tags';

// =============================================================================
// Types
// =============================================================================
export type { Category, CategoryListResult } from './content/types';

import type { PostCardData } from '@/types/blog';
export function transformWPPost(wpPost: any): PostCardData {
  // 1. 处理内容纯文本（用于计算字数和阅读时间）
  const rawContent = wpPost.content?.rendered || '';
  const plainText = rawContent.replace(/<[^>]+>/g, '').trim();

  // 2. 处理摘要（优先取手动填写的摘要，没有则截取正文）
  const rawExcerpt = wpPost.excerpt?.rendered || '';
  const plainDescription = rawExcerpt
    .replace(/<[^>]+>/g, '') // 去掉 HTML 标签
    .replace(/\s+/g, ' ') // 合并换行符和多余空格
    .trim()
    .slice(0, 150);

  // 3. 计算阅读指标
  const wordCount = plainText.length;
  const readingTime = `${Math.ceil(wordCount / 400)} 分钟`;

  // 4. 返回符合 PostCardData 接口的扁平对象
  return {
    slug: wpPost.id.toString(),
    link: wpPost.id.toString(), // 路由跳转通常使用 slug
    title: wpPost.title?.rendered || '无标题',
    description: plainDescription || '暂无描述',
    date: new Date(wpPost.date),

    // 获取特色图片：必须配合 API 的 _embed 参数
    // 路径：_embedded -> wp:featuredmedia (数组) -> [0] -> source_url
    cover: wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || undefined,

    // 获取标签和分类：WordPress 将它们都放在 wp:term 中
    // 通常索引 0 是分类 (category)，索引 1 是标签 (post_tag)
    categories: wpPost._embedded?.['wp:term']?.[0]?.map((c: any) => c.name) || [],
    tags: wpPost._embedded?.['wp:term']?.[1]?.map((t: any) => t.name) || [],

    draft: false, // WordPress API 默认只返回已发布的文章
    wordCount: wordCount,
    readingTime: readingTime,
  };
}
