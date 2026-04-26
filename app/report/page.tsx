'use client'

import { useEffect, useMemo, useState } from 'react'

import { MILESTONE_1_FIELD_IDS, getFieldById, type ApplicantProfile, type ApplicationTrack, type GksFieldId } from '@/lib/gks-schema'
import { ProfileStore } from '@/lib/profile-store'
import { generateCompletionReport, getPhoneCountryCodeHint } from '@/lib/validation'

const renderFieldLabel = (fieldId: GksFieldId) => {
  const field = getFieldById(fieldId)

  return field ? `${field.fieldLabel} (${field.id})` : fieldId
}

export default function ReportPage() {
  const [profileStore] = useState(() => new ProfileStore())
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({})

  useEffect(() => {
    setProfile(profileStore.load())
  }, [profileStore])

  const track: ApplicationTrack = profile.applicationTrack ?? 'embassy'
  const report = useMemo(() => generateCompletionReport(profile, track), [profile, track])
  const activeFieldCount = MILESTONE_1_FIELD_IDS.length - report.skipped.length
  const completeCount = activeFieldCount - report.missing.length - report.invalid.length
  const phoneHint = getPhoneCountryCodeHint(profile.phone)

  return (
    <main>
      <h1>Milestone 1 DOCX proof 준비 상태</h1>
      <p>현재 저장된 프로필을 기준으로 필수 누락, 형식 오류, 조건부 제외 항목을 분류합니다.</p>
      <p>기준 트랙: {track === 'embassy' ? '대사관 트랙' : '대학 트랙'}</p>
      {!profile.applicationTrack && (
        <p>아직 지원 트랙이 저장되지 않아 임시로 대사관 트랙 기준으로 계산했습니다.</p>
      )}

      <section>
        <h2>{report.readyForDocxProof ? 'DOCX proof 준비 완료' : 'DOCX proof 준비 미완료'}</h2>
        <p>
          완료 {completeCount}개 / 활성 항목 {activeFieldCount}개
        </p>
        <p>
          누락 {report.missing.length}개 / 오류 {report.invalid.length}개 / 건너뜀 {report.skipped.length}개
        </p>
        <p>
          공식 제출 판정은 아니며, Milestone 1 DOCX proof 정리 기준만 제공합니다.
        </p>
      </section>

      {phoneHint && (
        <section>
          <h2>전화번호 힌트</h2>
          <p>{phoneHint}</p>
        </section>
      )}

      <section>
        <h2>Missing fields</h2>
        {report.missing.length === 0 ? (
          <p>누락된 필수 항목이 없습니다.</p>
        ) : (
          <ul>
            {report.missing.map((fieldId) => (
              <li key={fieldId}>{renderFieldLabel(fieldId)}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Invalid fields</h2>
        {report.invalid.length === 0 ? (
          <p>형식 오류가 없습니다.</p>
        ) : (
          <ul>
            {report.invalid.map((entry) => (
              <li key={entry.fieldId}>
                {renderFieldLabel(entry.fieldId)}: {entry.errors.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Skipped fields</h2>
        {report.skipped.length === 0 ? (
          <p>조건부로 제외된 항목이 없습니다.</p>
        ) : (
          <ul>
            {report.skipped.map((fieldId) => (
              <li key={fieldId}>{renderFieldLabel(fieldId)}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
