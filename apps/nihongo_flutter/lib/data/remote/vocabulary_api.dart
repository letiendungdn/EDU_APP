import 'package:dio/dio.dart';

class VocabularyApi {
  VocabularyApi(this._dio);
  final Dio _dio;

  Future<List<Map<String, dynamic>>> fetchVocabPage({
    required int lessonNumber,
    int page = 1,
    int limit = 100,
  }) async {
    final res = await _dio.get<dynamic>(
      '/vocabularies',
      queryParameters: {
        'lessonNumber': lessonNumber,
        'page': page,
        'limit': limit,
      },
    );

    final body = res.data;
    if (body == null) return [];

    if (body is List) {
      return body
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }

    final data = body['data'];
    if (data is List) {
      return data
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }

    return [];
  }

  Future<List<Map<String, dynamic>>> fetchAllVocabForLesson(
    int lessonNumber,
  ) async {
    final all = <Map<String, dynamic>>[];
    var page = 1;
    const limit = 100;

    while (true) {
      final batch = await fetchVocabPage(
        lessonNumber: lessonNumber,
        page: page,
        limit: limit,
      );
      if (batch.isEmpty) break;
      all.addAll(batch);
      if (batch.length < limit) break;
      page += 1;
    }

    return all;
  }

  Future<void> syncReviewBank(List<Map<String, dynamic>> items) async {
    await _dio.post('/progress/review', data: {'items': items});
  }
}
