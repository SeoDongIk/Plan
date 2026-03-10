import neo4j from 'neo4j-driver';

// Create a singleton instance for the Neo4j driver
const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password123';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

/**
 * Saves a generated topic to the graph, connecting it to its base keyword.
 */
export async function saveTopicToGraph(keyword: string, topic: string, level: number) {
    const session = driver.session();
    try {
        const query = `
      MERGE (k:Keyword {text: $keyword})
      MERGE (t:Topic {text: $topic})
      SET t.level = $level
      MERGE (k)-[:GENERATED_TOPIC]->(t)
    `;
        await session.run(query, { keyword, topic, level });
        console.log(`[Graph DB] Saved Topic: "${topic}" under Keyword: "${keyword}"`);
    } catch (error) {
        console.error('[Graph DB Error] Failed to save topic:', error);
    } finally {
        await session.close();
    }
}

/**
 * Saves a generated content asset to the graph, connecting it to the topic.
 */
export async function saveContentToGraph(topic: string, contentType: 'Thumbnail' | 'CardNews', contentData: string) {
    const session = driver.session();
    try {
        const query = `
      MERGE (t:Topic {text: $topic})
      CREATE (c:Content {
        type: $contentType,
        data: $contentData,
        createdAt: datetime()
      })
      MERGE (t)-[:HAS_ASSET]->(c)
    `;
        await session.run(query, { topic, contentType, contentData });
        console.log(`[Graph DB] Saved ${contentType} asset for Topic: "${topic}"`);
    } catch (error) {
        console.error('[Graph DB Error] Failed to save content:', error);
    } finally {
        await session.close();
    }
}

/**
 * GraphRAG Core: Fetches surrounding context for a given topic to enrich new prompts.
 */
export async function fetchGraphContextForTopic(topic: string): Promise<string> {
    const session = driver.session();
    try {
        // Look for previous content generated for this topic to avoid duplication and maintain consistency
        const query = `
      MATCH (t:Topic {text: $topic})-[:HAS_ASSET]->(c:Content)
      RETURN c.type AS type, c.data AS data
      LIMIT 3
    `;
        const result = await session.run(query, { topic });

        if (result.records.length === 0) {
            return "";
        }

        let contextString = "[Graph Knowledge Basis // 이전 발간 기록]\n";
        result.records.forEach(record => {
            const type = record.get('type');
            let data = record.get('data');
            // Truncate if data is too long to save tokens
            if (data.length > 300) data = data.substring(0, 300) + '...';
            contextString += `- Previously generated ${type}: ${data}\n`;
        });

        contextString += "\n위 기록과 스타일/맥락을 유지하면서 새로운 콘텐츠 포맷에 맞게 변주해줘.\n";
        return contextString;

    } catch (error) {
        console.error('[Graph DB Error] Failed to fetch context:', error);
        return "";
    } finally {
        await session.close();
    }
}
