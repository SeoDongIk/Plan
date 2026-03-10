import { extractTrendTopics } from '../topic_extractor';
import * as serpapi_service from '../serpapi_service';
import * as graph_service from '../graph_service';

// Mock dependencies to avoid actual API calls during runtime error testing
jest.mock('../serpapi_service');
jest.mock('../graph_service');

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: (...args: any[]) => mockGenerateContent(...args)
                })
            };
        })
    };
});

describe('Topic Extractor - Runtime Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (serpapi_service.getYouTubeTrends as jest.Mock).mockResolvedValue('Mock YouTube Trends');
        (serpapi_service.getGoogleKeywordIdeas as jest.Mock).mockResolvedValue('Mock Google Trends');
        (graph_service.saveTopicToGraph as jest.Mock).mockResolvedValue(undefined);
    });

    it('should successfully parse valid JSON and return ExtractedTopic[] without runtime errors', async () => {
        const mockApiResponse = {
            response: {
                text: () => '\`\`\`json\n[{"level":1,"topic":"Test Topic","reasoning":"Test Reasoning"}]\n\`\`\`'
            }
        };
        mockGenerateContent.mockResolvedValueOnce(mockApiResponse);

        const result = await extractTrendTopics(1, 'Test Keyword');

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('level', 1);
        expect(result[0]).toHaveProperty('topic', 'Test Topic');
        expect(result[0]).toHaveProperty('reasoning', 'Test Reasoning');

        expect(graph_service.saveTopicToGraph).toHaveBeenCalledWith('Test Keyword', 'Test Topic', 1);
    });

    it('should handle Quota 429 runtime API errors safely without breaking UI', async () => {
        const fakeError = new Error('429 Quota Exceeded');
        mockGenerateContent.mockRejectedValueOnce(fakeError);

        const result = await extractTrendTopics(1, 'Test Keyword');

        expect(result).toHaveLength(3);
        expect(result[0].topic).toContain('API 할당량 초과');
    });

    it('should correctly cleanse random string output containing markdown and fallback softly on total failure', async () => {
        const fakeError = new Error('SyntaxError: Unexpected token');
        mockGenerateContent.mockRejectedValueOnce(fakeError);

        await expect(extractTrendTopics(1, 'Test Keyword')).rejects.toThrow('주제 추출에 실패했습니다');
    });
});
