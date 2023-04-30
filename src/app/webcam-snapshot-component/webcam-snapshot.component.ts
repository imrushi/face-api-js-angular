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
    navigator.mediaDevices.getUserMedia(
      { video: {}, audio: false },
    ).then((stream) => this.vid.srcObject = stream)
      .catch((error) => console.log(error))
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
        this.canvas.setAttribute('id', 'canvass');
        this.canvas.setAttribute(
          'style',
          `position: fixed;
        top: 0;
        left: 0;`
        );
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
}
