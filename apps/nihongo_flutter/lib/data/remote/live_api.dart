import 'package:dio/dio.dart';

class LiveSessionSummary {
  const LiveSessionSummary({
    required this.id,
    required this.title,
    required this.roomName,
    required this.status,
    this.coachName,
  });

  factory LiveSessionSummary.fromJson(Map<String, dynamic> json) {
    final coach = json['coach'] as Map<String, dynamic>?;
    return LiveSessionSummary(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      roomName: json['roomName'] as String? ?? '',
      status: json['status'] as String? ?? 'LIVE',
      coachName: coach?['name'] as String?,
    );
  }

  final int id;
  final String title;
  final String roomName;
  final String status;
  final String? coachName;
}

class LiveJoinResponse {
  const LiveJoinResponse({
    required this.sessionId,
    required this.token,
    required this.wsUrl,
    required this.roomName,
    this.title,
  });

  factory LiveJoinResponse.fromJson(Map<String, dynamic> json) {
    return LiveJoinResponse(
      sessionId: json['sessionId'] as int,
      token: json['token'] as String,
      wsUrl: json['wsUrl'] as String,
      roomName: json['roomName'] as String? ?? '',
      title: json['title'] as String?,
    );
  }

  final int sessionId;
  final String token;
  final String wsUrl;
  final String roomName;
  final String? title;
}

class LiveApi {
  LiveApi(this._dio);
  final Dio _dio;

  Future<List<LiveSessionSummary>> listLiveSessions() async {
    final res = await _dio.get<dynamic>('/live/sessions');
    final data = res.data;
    if (data is! List) return [];
    return data
        .map((e) => LiveSessionSummary.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<LiveJoinResponse> createSession(String title) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/live/sessions',
      data: {'title': title},
    );
    return LiveJoinResponse.fromJson(res.data!);
  }

  Future<LiveJoinResponse> joinSession(int sessionId) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/live/sessions/$sessionId/join',
    );
    return LiveJoinResponse.fromJson(res.data!);
  }

  Future<void> endSession(int sessionId) async {
    await _dio.delete('/live/sessions/$sessionId');
  }
}
