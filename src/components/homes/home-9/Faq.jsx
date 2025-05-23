'use client'
import { faqs2 } from '../../../data/faq'
import Image from '../../common/Image'
import { useState } from 'react'
import ModalVideo from 'react-modal-video'

export default function Faq() {
  const [isOpen, setIsOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  return (
    <section className="bg-light-base py-24 dark:bg-jacarta-800">
      <div className="container">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-6 text-center font-display text-3xl font-medium text-jacarta-700 dark:text-white">
            Frequently Asked Questions (FAQ)
          </h2>
        </div>
        <div className="lg:flex lg:flex-nowrap">
          <div className="lg:w-[59%]">
            <figure className="relative mb-8 overflow-hidden rounded-3xl before:absolute before:inset-0 before:bg-jacarta-900/25">
              <div
                onClick={() => setIsOpen(true)}
                className=" cursor-pointer js-video-modal-trigger absolute top-1/2 left-1/2 flex h-16 w-16 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white transition-transform will-change-transform hover:scale-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="h-rotate h-8 w-8 fill-white"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" />
                </svg>
              </div>
              <Image
                width={690}
                height={541}
                src="/thumb.png"
                className="w-full"
                alt="image"
              />
            </figure>
          </div>
          <div className="lg:w-[41%] lg:pl-24">
            <div className="accordion mx-auto max-w-[35rem]" id="accordionFAQ">
              {faqs2.map((elm, i) => (
                <div
                  key={i}
                  className="accordion-item mb-5 overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600"
                >
                  <h2 className="accordion-header" id={`faq-heading-${elm.id}`}>
                    <button
                      className={`accordion-button relative flex w-full items-center justify-between bg-white px-4 py-3 text-left font-display text-sm text-jacarta-700 dark:bg-jacarta-700 dark:text-white ${
                        openIndex === i ? '' : 'collapsed'
                      }`}
                      type="button"
                      onClick={() => handleToggle(i)}
                      aria-expanded={openIndex === i}
                      aria-controls={`faq-${elm.id}`}
                    >
                      <span>{elm.question}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className={`accordion-arrow h-4 w-4 shrink-0 fill-jacarta-700 transition-transform dark:fill-white ${
                          openIndex === i ? 'rotate-180' : ''
                        }`}
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
                      </svg>
                    </button>
                  </h2>
                  <div
                    id={`faq-${elm.id}`}
                    className={`accordion-collapse ${
                      openIndex === i ? 'block' : 'hidden'
                    }`}
                    aria-labelledby={`faq-heading-${elm.id}`}
                  >
                    <div className="accordion-body border-t border-jacarta-100 bg-white p-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                      <p className="dark:text-jacarta-200">{elm.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="-2qdOgn2efY"
        onClose={() => setIsOpen(false)}
      />
    </section>
  )
}
