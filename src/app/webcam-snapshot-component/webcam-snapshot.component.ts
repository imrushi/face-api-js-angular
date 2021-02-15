import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-webcam-snapshot-component',
  templateUrl: './webcam-snapshot.component.html',
  styleUrls: ['./webcam-snapshot.component.css'],
})
export class WebcamSnapshotComponent implements OnInit {
  WIDTH = 440;
  HEIGHT = 280;

  @ViewChild('video')
  public video: ElementRef;

  @ViewChild('canvas')
  public canvasRef: ElementRef;

  constructor(private elRef: ElementRef) {}

  captures: string[] = [];
  error: any;
  isCaptured: boolean;
  stream: any;
  detection;
  displayValues;
  resizedDetections;
  canvas;
  displaySize;
  vid;
  ctx;
  async ngOnInit() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),
    ]).then(() => this.startVideo());
  }
  startVideo() {
    this.vid = document.getElementById('video');
    navigator.getUserMedia(
      { video: {}, audio: false },
      (stream) => (this.vid.srcObject = stream),
      (err) => console.log(err)
    );
    console.log(this.canvasRef);
    this.detectF();
  }
  async detectF() {
    // this.vid = document.getElementById('video');
    this.elRef.nativeElement
      .querySelector('video')
      .addEventListener('play', async () => {
        this.canvas = await faceapi.createCanvasFromMedia(this.vid);
        // console.log(this.video);

        document.getElementById('canvasEL').appendChild(this.canvas);
        this.displaySize = {
          width: this.vid.width,
          height: this.vid.height,
        };
        faceapi.matchDimensions(this.canvas, this.displaySize);
        setInterval(async () => {
          this.detection = await faceapi
            .detectAllFaces(this.vid, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );

          this.canvas
            .getContext('2d')
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }, 100);
      });
  }

  // async playVideo() {
  //   await faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
  //     await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
  //     await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
  //     await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models');

  //   this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //   this.video.srcObject = this.stream;
  //   this.videoCanvas();
  // }

  // videoCanvas() {
  //   this.elRef.nativeElement.addEventListener('play', () => {
  //     this.canvas = faceapi.createCanvasFromMedia(this.video);
  //     this.canvasRef.nativeElement.appendChild(this.canvas);
  //     this.displayValues = {
  //       width: this.video.width,
  //       height: this.video.height,
  //     };

  //     // ### Resize media elements
  //     faceapi.matchDimensions(this.canvas, this.displayValues);
  //     setInterval(async () => {
  //       this.detection = await faceapi
  //         .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
  //         .withFaceLandmarks()
  //         .withFaceDescriptors();

  //       this.resizedDetections = faceapi.resizeResults(
  //         this.detection,
  //         this.displayValues
  //       );
  //       this.canvas
  //         .getContext('2d')
  //         .clearRect(0, 0, this.canvas.width, this.canvas.height);
  //       faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
  //     }, 100);
  //   });
  // }

  // async setupDevices() {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       if (stream) {
  //         this.video.nativeElement.srcObject = stream;
  //         this.video.nativeElement.play();
  //         this.error = null;
  //       } else {
  //         this.error = 'You have no output video device';
  //       }
  //     } catch (e) {
  //       this.error = e;
  //     }
  //   }
  // }

  // capture() {
  //   this.drawImageToCanvas(this.video.nativeElement);
  //   this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
  //   this.isCaptured = true;
  // }

  // drawImageToCanvas(image: any) {
  //   this.canvas.nativeElement
  //     .getContext('2d')
  //     .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  // }
}
