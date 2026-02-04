import React, { useEffect } from "react";

import { t } from "../i18n";

import "./Range.scss";

import type { AppClassProperties } from "../types";
import {ROUNDNESS} from "@excalidraw/common";

export type RangeProps = {
  updateData: (value: number) => void;
  app: AppClassProperties;
  testId?: string;
};

export const Range = ({ updateData, app, testId }: RangeProps) => {
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLDivElement>(null);
  const selectedElements = app.scene.getSelectedElements(app.state);
  let hasCommonOpacity = true;
  const firstElement = selectedElements.at(0);
  const leastCommonOpacity = selectedElements.reduce((acc, element) => {
    if (acc != null && acc !== element.opacity) {
      hasCommonOpacity = false;
    }
    if (acc == null || acc > element.opacity) {
      return element.opacity;
    }
    return acc;
  }, firstElement?.opacity ?? null);

  const value = leastCommonOpacity ?? app.state.currentItemOpacity;

  useEffect(() => {
    if (rangeRef.current && valueRef.current) {
      const rangeElement = rangeRef.current;
      const valueElement = valueRef.current;
      const inputWidth = rangeElement.offsetWidth;
      const thumbWidth = 15; // 15 is the width of the thumb
      const position =
        (value / 100) * (inputWidth - thumbWidth) + thumbWidth / 2;
      valueElement.style.left = `${position}px`;
      rangeElement.style.background = `linear-gradient(to right, var(--color-slider-track) 0%, var(--color-slider-track) ${value}%, var(--button-bg) ${value}%, var(--button-bg) 100%)`;
    }
  }, [value]);

  return (
    <label className="control-label">
      {t("labels.opacity")}
      <div className="range-wrapper">
        <input
          style={{
            ["--color-slider-track" as string]: hasCommonOpacity
              ? undefined
              : "var(--button-bg)",
          }}
          ref={rangeRef}
          type="range"
          min="0"
          max="100"
          step="10"
          onChange={event => {
            updateData(+event.target.value);
          }}
          value={value}
          className="range-input"
          data-testid={testId}
        />
        <div className="value-bubble" ref={valueRef}>
          {value !== 0 ? value : null}
        </div>
        <div className="zero-label">0</div>
      </div>
    </label>
  );
};


export type RoundnessRangeProps = {
  updateData: (value: number) => void;
  app: AppClassProperties;
  testId?: string;
};

export const RoundnessRange = ({ updateData, app, testId }: RoundnessRangeProps) => {
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLDivElement>(null);
  const selectedElements = app.scene.getSelectedElements(app.state);

  let hasCommonRoundness = true;
  const firstElement = selectedElements.at(0);

  // Get the roundness value as a percentage (0-100)
  const getRoundnessValue = (element: any) => {
    if (!element.roundness || element.roundness.value === undefined) {
      return 50; // Default to 50% (25px or 0.25)
    }

    const roundnessValue = element.roundness.value;
    const roundnessType = element.roundness.type;

    if (roundnessType === ROUNDNESS.ADAPTIVE_RADIUS) {
      // For adaptive radius: value is 0-50 pixels
      // Convert to 0-100 slider range
      return (roundnessValue / 50) * 100;
    } else {
      // For PROPORTIONAL_RADIUS and LEGACY: value is 0-0.5 ratio
      // Convert to 0-100 slider range
      return (roundnessValue / 0.5) * 100;
    }
  };

  const roundnessValues = selectedElements.map(element => getRoundnessValue(element));

  // Check if all elements have the same roundness value (within a small tolerance)
  const firstValue = roundnessValues[0];
  hasCommonRoundness = roundnessValues.every(val => Math.abs(val - firstValue) < 2);

  // Use the minimum value if they differ
  const leastCommonRoundness = Math.min(...roundnessValues.filter(v => !isNaN(v)));
  const value = isFinite(leastCommonRoundness) ? leastCommonRoundness : 50;

  useEffect(() => {
    if (rangeRef.current && valueRef.current) {
      const rangeElement = rangeRef.current;
      const valueElement = valueRef.current;
      const inputWidth = rangeElement.offsetWidth;
      const thumbWidth = 15;
      const position =
          (value / 100) * (inputWidth - thumbWidth) + thumbWidth / 2;
      valueElement.style.left = `${position}px`;
      rangeElement.style.background = `linear-gradient(to right, var(--color-slider-track) 0%, var(--color-slider-track) ${value}%, var(--button-bg) ${value}%, var(--button-bg) 100%)`;
    }
  }, [value]);

  return (
      <label className="control-label">
        {t("labels.roundness")}
        <div className="range-wrapper">
          <input
              style={{
                ["--color-slider-track" as string]: hasCommonRoundness
                    ? undefined
                    : "var(--button-bg)",
              }}
              ref={rangeRef}
              type="range"
              min="0"
              max="100"
              step="5"
              onChange={event => {
                updateData(+event.target.value);
              }}
              value={value}
              className="range-input"
              data-testid={testId}
          />
          <div className="value-bubble" ref={valueRef}>
            {value !== 0 ? Math.round(value) : null}
          </div>
          <div className="zero-label">0</div>
        </div>
      </label>
  );
};