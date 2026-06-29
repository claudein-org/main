import { db } from '@/lib/db'

export interface Page {
    page_id: string
    page_name: string
}

export async function getStatus(user_id: number): Promise<{ connected: boolean; pages: Page[] }> {
    const rows = await db
        .selectFrom('facebook')
        .select(['page_id', 'page_name'])
        .where('user_id', '=', user_id)
        .orderBy('page_name')
        .execute()

    const pages = rows.map(r => ({ page_id: r.page_id, page_name: r.page_name }))
    return { connected: pages.length > 0, pages }
}
