import { yml } from '@claudein.org/common'
import { writeFile } from 'fs/promises'
import { stringify } from 'yaml'

if (import.meta.main) {
    const schema = yml.Posts.toJSONSchema()
    await writeFile('claudein.schema.yml', stringify(schema))
}