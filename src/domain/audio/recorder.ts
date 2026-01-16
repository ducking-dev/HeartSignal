'use client';

interface RecorderConfig {
  sampleRate?: number;          // 16000 (기본값)
  channels?: number;            // 1 (모노)
  mimeType?: string;           // 'audio/webm;codecs=opus'
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private isActive = false;

  async start(config?: RecorderConfig): Promise<void> {
    try {
      // 브라우저 지원 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 마이크 녹음을 지원하지 않습니다. Chrome, Firefox, Safari를 사용해주세요.');
      }

      // MediaRecorder 지원 확인
      if (!window.MediaRecorder) {
        throw new Error('이 브라우저는 오디오 녹음을 지원하지 않습니다.');
      }

      // 마이크 권한 요청
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config?.sampleRate || 16000,
          channelCount: config?.channels || 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // MediaRecorder 설정
      const mimeType = this.getSupportedMimeType(config?.mimeType);
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.chunks = [];

      // 이벤트 리스너
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
      };

      // 녹음 시작
      this.mediaRecorder.start(100); // 100ms마다 chunk 생성
      this.isActive = true;

    } catch (error: unknown) {
      this.cleanup();
      
      // 구체적인 에러 메시지 제공
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('마이크가 다른 애플리케이션에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.');
        } else if (error.name === 'OverconstrainedError') {
          throw new Error('요청한 오디오 설정이 지원되지 않습니다.');
        } else {
          throw new Error(`녹음을 시작할 수 없습니다: ${error.message}`);
        }
      }
      
      throw new Error('녹음을 시작할 수 없습니다: 알 수 없는 오류');
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isActive) {
        reject(new Error('녹음이 진행 중이지 않습니다.'));
        return;
      }

      // 타임아웃 설정 (5초 후 강제 종료)
      const timeout = setTimeout(() => {
        console.warn('녹음 중지 타임아웃, 강제 종료');
        const blob = new Blob(this.chunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        this.cleanup();
        resolve(blob);
      }, 5000);

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeout);
        const blob = new Blob(this.chunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        
        // 리소스 정리
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        clearTimeout(timeout);
        console.error('MediaRecorder stop error:', event);
        this.cleanup();
        reject(new Error('녹음 중지 중 오류가 발생했습니다.'));
      };

      try {
        this.mediaRecorder.stop();
        this.isActive = false;
      } catch (error: unknown) {
        clearTimeout(timeout);
        this.cleanup();
        reject(error);
      }
    });
  }

  getChunks(): Blob[] {
    return [...this.chunks];
  }

  isRecording(): boolean {
    return this.isActive && this.mediaRecorder?.state === 'recording';
  }

  private getSupportedMimeType(preferred?: string): string {
    const types = [
      preferred,
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ].filter(Boolean) as string[];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    throw new Error('지원되는 오디오 형식이 없습니다.');
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.isActive = false;
  }
}
